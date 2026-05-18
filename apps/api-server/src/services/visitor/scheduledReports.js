/**
 * Scheduled Reports Service
 * 
 * Generate and schedule automated analytics reports
 */

const VisitorService = require('./visitorService');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class ScheduledReportsService {
  constructor() {
    this.reportsDirectory = path.join(process.cwd(), 'generated_reports');
    this.jobs = new Map();
    this.initializeReportsDirectory();
  }

  async initializeReportsDirectory() {
    try {
      await fs.mkdir(this.reportsDirectory, { recursive: true });
      // Reports directory initialized
    } catch (error) {
      console.error('Failed to create reports directory:', error);
    }
  }

  /**
   * Generate comprehensive daily report
   */
  async generateDailyReport(date = null) {
    try {
      const reportDate = date || new Date();
      const dateString = reportDate.toISOString().split('T')[0];

      // Generating daily report

      // Gather analytics data
      const [
        overview,
        performance,
        journey,
        geoAnalytics,
        trafficSources,
        topPages,
        spikes
      ] = await Promise.all([
        VisitorService.getAnalyticsOverview(1), // Last 24 hours
        VisitorService.getPerformanceAnalytics(1, 'hourly'),
        VisitorService.getVisitorJourneyAnalytics(1, 50),
        VisitorService.getEnhancedCountryAnalytics(1, 'hourly'),
        VisitorService.getTrafficSourceAnalytics(1),
        VisitorService.getEnhancedTopPagesAnalytics(1, 'hourly', 10),
        VisitorService.detectTrafficSpikes('medium', 24)
      ]);

      const report = {
        reportInfo: {
          type: 'daily',
          date: dateString,
          generatedAt: new Date().toISOString(),
          period: '24 hours'
        },
        summary: {
          totalVisitors: overview.totalVisitors || 0,
          uniqueVisitors: overview.uniqueVisitors || 0,
          pageViews: overview.totalPageViews || 0,
          avgEngagementTime: overview.avgEngagementTime || 0,
          topCountry: geoAnalytics.countryTrends?.[0]?.country || 'N/A',
          avgLoadTime: performance.summary?.avgLoadTime || 0
        },
        analytics: {
          overview,
          performance: {
            summary: performance.summary,
            slowPages: performance.timeSeriesData?.filter(p => p.avgLoadTime > 3000).length || 0
          },
          geographic: {
            totalCountries: geoAnalytics.meta?.totalCountries || 0,
            topCountries: geoAnalytics.countryTrends?.slice(0, 5) || []
          },
          traffic: {
            topSources: trafficSources?.slice(0, 5) || [],
            totalSources: trafficSources?.length || 0
          },
          pages: {
            topPages: topPages.topPages?.slice(0, 5) || [],
            totalPages: topPages.meta?.totalPages || 0
          },
          userJourney: {
            avgPagesPerSession: journey.summary?.avgPagesPerSession || 0,
            avgSessionDuration: journey.summary?.avgSessionDuration || 0,
            journeyTypes: journey.summary?.journeyTypes || {}
          }
        },
        alerts: {
          trafficSpikes: spikes.spikes || [],
          anomalies: spikes.anomalies || [],
          slowPages: performance.timeSeriesData?.filter(p => p.avgLoadTime > 5000) || []
        },
        recommendations: this.generateRecommendations(overview, performance, journey)
      };

      // Save report
      const filename = `daily_report_${dateString}.json`;
      const filepath = path.join(this.reportsDirectory, filename);
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));

      // Daily report generated successfully
      return { success: true, filename, filepath, report };
    } catch (error) {
      console.error('Error generating daily report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate weekly summary report
   */
  async generateWeeklyReport() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const weekString = `${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;

      // Generating weekly report

      const [
        overview,
        sessionsByBrowser,
        countryAnalytics,
        topPages,
        performance
      ] = await Promise.all([
        VisitorService.getAnalyticsOverview(7),
        VisitorService.getSessionTrackingByBrowser(7, 'daily'),
        VisitorService.getEnhancedCountryAnalytics(7, 'daily'),
        VisitorService.getEnhancedTopPagesAnalytics(7, 'daily', 15),
        VisitorService.getPerformanceAnalytics(7, 'daily')
      ]);

      const report = {
        reportInfo: {
          type: 'weekly',
          period: weekString,
          generatedAt: new Date().toISOString(),
          daysIncluded: 7
        },
        summary: {
          totalVisitors: overview.totalVisitors || 0,
          dailyAverage: Math.round((overview.totalVisitors || 0) / 7),
          uniqueCountries: overview.uniqueCountries || 0,
          topBrowser: sessionsByBrowser.browserSummary?.[0]?.browser || 'N/A',
          bestPerformingPage: topPages.topPages?.[0]?.path || 'N/A'
        },
        trends: {
          visitorGrowth: this.calculateGrowthTrend(overview),
          countryTrends: countryAnalytics.countryTrends?.slice(0, 10) || [],
          browserTrends: sessionsByBrowser.browserSummary || [],
          performanceTrends: performance.timeSeriesData || []
        },
        insights: this.generateWeeklyInsights(overview, sessionsByBrowser, countryAnalytics, topPages)
      };

      const filename = `weekly_report_${weekString}.json`;
      const filepath = path.join(this.reportsDirectory, filename);
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));

      // Weekly report generated successfully
      return { success: true, filename, filepath, report };
    } catch (error) {
      console.error('Error generating weekly report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule automated reports
   */
  scheduleReports() {
    // Daily report at 2 AM
    const dailyJob = cron.schedule('0 2 * * *', async () => {
      // Running scheduled daily report
      await this.generateDailyReport();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Weekly report on Mondays at 3 AM
    const weeklyJob = cron.schedule('0 3 * * 1', async () => {
      // Running scheduled weekly report
      await this.generateWeeklyReport();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.set('daily', dailyJob);
    this.jobs.set('weekly', weeklyJob);

    // Start jobs if enabled
    if (process.env.ENABLE_SCHEDULED_REPORTS === 'true') {
      dailyJob.start();
      weeklyJob.start();
      // Scheduled reports enabled
    } else {
      // Scheduled reports disabled
    }

    return { daily: dailyJob, weekly: weeklyJob };
  }

  /**
   * Generate recommendations based on analytics data
   */
  generateRecommendations(overview, performance, journey) {
    const recommendations = [];

    // Performance recommendations
    if (performance.summary?.avgLoadTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Average page load time is ${performance.summary.avgLoadTime}ms. Consider optimizing images, minifying CSS/JS, or implementing caching.`
      });
    }

    // Engagement recommendations
    if (overview.avgEngagementTime < 30000) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Low engagement time detected. Consider improving content quality or page design.'
      });
    }

    // Journey recommendations
    if (journey.summary?.avgPagesPerSession < 2) {
      recommendations.push({
        type: 'navigation',
        priority: 'medium',
        message: 'Users are not exploring multiple pages. Consider adding related content links or improving navigation.'
      });
    }

    // Bounce rate (estimated from single-page sessions)
    const bounceRate = (journey.summary?.journeyTypes?.singlePage / journey.summary?.totalJourneys) * 100;
    if (bounceRate > 70) {
      recommendations.push({
        type: 'bounce_rate',
        priority: 'high',
        message: `High bounce rate (~${Math.round(bounceRate)}%). Review landing page content and user experience.`
      });
    }

    return recommendations;
  }

  /**
   * Generate weekly insights
   */
  generateWeeklyInsights(overview, sessions, countries, pages) {
    const insights = [];

    // Top insights
    if (sessions.browserSummary?.[0]) {
      insights.push(`${sessions.browserSummary[0].browser} dominates with ${sessions.browserSummary[0].marketSharePercentage}% market share`);
    }

    if (countries.countryTrends?.[0]) {
      insights.push(`${countries.countryTrends[0].country} leads with ${countries.countryTrends[0].totalVisitors} visitors`);
    }

    if (pages.topPages?.[0]) {
      insights.push(`${pages.topPages[0].path} is the most popular page with ${pages.topPages[0].totalVisits} visits`);
    }

    return insights;
  }

  /**
   * Calculate growth trend (simplified)
   */
  calculateGrowthTrend(overview) {
    // This is a simplified calculation - in production you'd compare with previous periods
    return {
      trend: 'stable',
      percentage: 0,
      note: 'Growth calculation requires historical data comparison'
    };
  }

  /**
   * List generated reports
   */
  async listReports() {
    try {
      const files = await fs.readdir(this.reportsDirectory);
      const reports = files
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          filename: file,
          type: file.includes('daily') ? 'daily' : 'weekly',
          date: file.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'unknown'
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return reports;
    } catch (error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }

  /**
   * Get report by filename
   */
  async getReport(filename) {
    try {
      const filepath = path.join(this.reportsDirectory, filename);
      const content = await fs.readFile(filepath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading report:', error);
      return null;
    }
  }

  /**
   * Delete old reports (keep last 30 days)
   */
  async cleanupOldReports(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.reportsDirectory);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;
      for (const file of files) {
        const match = file.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
          const fileDate = new Date(match[0]);
          if (fileDate < cutoffDate) {
            await fs.unlink(path.join(this.reportsDirectory, file));
            deletedCount++;
          }
        }
      }

      // Cleaned up old reports
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up reports:', error);
      return 0;
    }
  }
}

module.exports = new ScheduledReportsService();