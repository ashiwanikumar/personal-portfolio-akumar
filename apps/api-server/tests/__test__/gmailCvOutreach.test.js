require("module-alias/register");

const {
  parseAddressList,
  companyNameFromDomain,
  buildQuery,
  buildOutreachDoc,
  config,
} = require("@services/gmail/cvOutreachSyncService");

/**********************************
  Gmail CV outreach — parsing tests
***********************************/

const cfg = () => config();

describe("parseAddressList", () => {
  it("parses a display name with angle brackets", () => {
    expect(parseAddressList("Jane Doe <jane@acme.com>")).toEqual([
      { name: "Jane Doe", email: "jane@acme.com" },
    ]);
  });

  it("parses a bare address", () => {
    expect(parseAddressList("bob@acme.com")).toEqual([{ name: "", email: "bob@acme.com" }]);
  });

  it("does not split on a comma inside a quoted name", () => {
    expect(parseAddressList('"Doe, Jane" <jane@acme.com>, bob@x.io')).toEqual([
      { name: "Doe, Jane", email: "jane@acme.com" },
      { name: "", email: "bob@x.io" },
    ]);
  });

  it("lowercases addresses and ignores empty input", () => {
    expect(parseAddressList("HR@Acme.COM")).toEqual([{ name: "", email: "hr@acme.com" }]);
    expect(parseAddressList("")).toEqual([]);
  });
});

describe("companyNameFromDomain", () => {
  it("strips recruiting subdomains and title-cases the core name", () => {
    expect(companyNameFromDomain("careers.acme-corp.com")).toBe("Acme Corp");
    expect(companyNameFromDomain("jobs.bigco.co.uk")).toBe("Bigco");
    expect(companyNameFromDomain("stripe.com")).toBe("Stripe");
  });

  it("returns blank for personal mail providers", () => {
    expect(companyNameFromDomain("gmail.com")).toBe("");
    expect(companyNameFromDomain("outlook.com")).toBe("");
  });
});

describe("buildQuery", () => {
  it("targets sent mail with matching attachments", () => {
    expect(buildQuery(null, cfg())).toBe("in:sent has:attachment filename:(pdf OR doc OR docx)");
  });

  it("steps the watermark back a day, since Gmail's after: is date-granular", () => {
    expect(buildQuery(new Date("2026-03-10T12:00:00Z"), cfg())).toContain("after:2026/03/09");
  });
});

describe("buildOutreachDoc", () => {
  const message = {
    id: "18f0abc",
    threadId: "18f0abc",
    historyId: "99",
    labelIds: ["SENT"],
    snippet: "Please find my CV attached",
    internalDate: "1772280000000",
    payload: {
      mimeType: "multipart/mixed",
      headers: [
        { name: "From", value: "Ashiwani Kumar <me@gmail.com>" },
        { name: "To", value: "Recruiter <hr@acme-corp.com>" },
        { name: "Cc", value: "team@acme-corp.com" },
        { name: "Subject", value: "Application: DevOps Engineer" },
      ],
      parts: [
        { mimeType: "text/plain", body: { size: 100, data: "" } },
        {
          mimeType: "application/pdf",
          filename: "Ashiwani_Kumar_DevOps_Resume.pdf",
          body: { size: 245678, attachmentId: "att1" },
        },
        {
          mimeType: "image/png",
          filename: "signature.png",
          body: { size: 4096, attachmentId: "att2" },
        },
      ],
    },
  };

  it("extracts the CV, recipient and company", () => {
    const doc = buildOutreachDoc(message, cfg());

    expect(doc.cvFileName).toBe("Ashiwani_Kumar_DevOps_Resume.pdf");
    expect(doc.companyName).toBe("Acme Corp");
    expect(doc.primaryRecipient).toBe("hr@acme-corp.com");
    expect(doc.recipientCount).toBe(2);
    expect(doc.sentAt.getTime()).toBe(1772280000000);
  });

  it("does not flag non-CV attachments", () => {
    const doc = buildOutreachDoc(message, cfg());
    expect(doc.attachments.find((a) => a.filename === "signature.png").isCv).toBe(false);
  });

  it("skips messages whose attachments are not a CV", () => {
    const invoice = {
      ...message,
      payload: {
        ...message.payload,
        parts: [
          {
            mimeType: "application/pdf",
            filename: "invoice_2026.pdf",
            body: { size: 1000, attachmentId: "a" },
          },
        ],
      },
    };

    expect(buildOutreachDoc(invoice, cfg())).toBeNull();
  });

  it("skips CV-named files of the wrong type", () => {
    const photo = {
      ...message,
      payload: {
        ...message.payload,
        parts: [
          {
            mimeType: "image/jpeg",
            filename: "my-cv-photo.jpg",
            body: { size: 1000, attachmentId: "a" },
          },
        ],
      },
    };

    expect(buildOutreachDoc(photo, cfg())).toBeNull();
  });
});
