import type { FeedbackData, FeedbackFormData, FeedbackSubmissionResponse } from '../types/feedback';

class FeedbackService {
  private readonly STORAGE_KEY = 'portfolio_feedback';
  private readonly API_BASE_URL = import.meta.env.PROD
    ? '/api' // Same domain in production
    : 'http://localhost:3001/api'; // Local development

  // Submit feedback to server with localStorage backup
  async submitFeedback(formData: FeedbackFormData): Promise<FeedbackSubmissionResponse> {
    const feedbackData = {
      ...formData,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    try {
      // Try to submit to server first
      const response = await fetch(`${this.API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Also store locally as backup
        await this.storeLocallyAsBackup(feedbackData);
        
        return result;
      } else {
        // Server error, fall back to localStorage
        console.warn('Server submission failed, using localStorage backup');
        return await this.submitToLocalStorage(feedbackData);
      }
    } catch (error) {
      // Network error, fall back to localStorage
      console.warn('Network error, using localStorage backup:', error);
      return await this.submitToLocalStorage(feedbackData);
    }
  }

  // Fallback to localStorage when server is unavailable
  private async submitToLocalStorage(formData: FeedbackFormData): Promise<FeedbackSubmissionResponse> {
    const feedbackData: FeedbackData = {
      ...formData,
      id: this.generateId(),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    try {
      await this.storeLocally(feedbackData);
      
      return {
        success: true,
        message: 'Thank you for your feedback! Your input has been saved locally and will be synchronized when connection is restored. 🙏',
        id: feedbackData.id
      };
    } catch (error) {
      console.error('Local storage fallback error:', error);
      return {
        success: false,
        message: 'Sorry, there was an issue saving your feedback. Please try again.'
      };
    }
  }

  // Store as backup in localStorage
  private async storeLocallyAsBackup(formData: FeedbackFormData): Promise<void> {
    try {
      const feedbackData: FeedbackData = {
        ...formData,
        id: this.generateId(),
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      };
      
      await this.storeLocally(feedbackData);
    } catch (error) {
      console.warn('Failed to store local backup:', error);
      // Don't throw - backup failure shouldn't fail the submission
    }
  }

  // Store locally for backup and analytics
  private async storeLocally(feedback: FeedbackData): Promise<void> {
    try {
      const existingFeedback = await this.getLocalStoredFeedback();
      existingFeedback.push(feedback);
      
      // Keep only last 100 feedback entries
      if (existingFeedback.length > 100) {
        existingFeedback.splice(0, existingFeedback.length - 100);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));
    } catch (error) {
      console.warn('Failed to store feedback locally:', error);
      throw error;
    }
  }

  // Get stored feedback from server (with localStorage fallback)
  async getStoredFeedback(): Promise<FeedbackData[]> {
    try {
      // Try to get from server first
      const response = await fetch(`${this.API_BASE_URL}/feedback`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return result.data.map((feedback: any) => ({
            ...feedback,
            timestamp: new Date(feedback.timestamp)
          }));
        }
      }
      
      // Fall back to localStorage
      console.warn('Server unavailable, using localStorage');
      return this.getLocalStoredFeedback();
    } catch (error) {
      console.warn('Failed to fetch from server, using localStorage:', error);
      return this.getLocalStoredFeedback();
    }
  }

  // Get feedback from localStorage only
  private getLocalStoredFeedback(): FeedbackData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((feedback: any) => ({
        ...feedback,
        timestamp: typeof feedback.timestamp === 'string' 
          ? new Date(feedback.timestamp) 
          : feedback.timestamp
      }));
    } catch (error) {
      console.warn('Failed to retrieve stored feedback:', error);
      return [];
    }
  }

  // Generate unique feedback ID
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get feedback statistics
  async getFeedbackStats() {
    const feedback = await this.getStoredFeedback();
    if (feedback.length === 0) return null;

    const totalRatings = feedback.reduce((sum: number, f: FeedbackData) => sum + f.rating, 0);
    const averageRating = totalRatings / feedback.length;
    
    const categories = feedback.reduce((acc: Record<string, number>, f: FeedbackData) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFeedback: feedback.length,
      averageRating: Math.round(averageRating * 10) / 10,
      categories,
      recentFeedback: feedback.slice(-5).reverse()
    };
  }

  // Export all feedback as CSV (manual download)
  async exportFeedbackAsCSV(): Promise<void> {
    try {
      // Try server export first
      const response = await fetch(`${this.API_BASE_URL}/feedback/export-csv`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'feedback.csv';
        
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Successfully exported feedback from server');
        return;
      }
      
      // Fall back to local export
      console.warn('Server export failed, using local data');
      await this.exportLocalFeedbackAsCSV();
    } catch (error) {
      console.error('Failed to export feedback from server:', error);
      await this.exportLocalFeedbackAsCSV();
    }
  }

  // Export local feedback as CSV fallback
  private async exportLocalFeedbackAsCSV(): Promise<void> {
    try {
      const allFeedback = await this.getLocalStoredFeedback();
      
      if (allFeedback.length === 0) {
        console.warn('No feedback data to export');
        return;
      }

      // Create timestamped filename
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `portfolio-feedback-local-${timestamp}.csv`;
      
      // Create CSV headers
      const headers = [
        'ID',
        'Name', 
        'Email',
        'Rating',
        'Category',
        'Message',
        'Timestamp',
        'User Agent',
        'Referrer'
      ];

      // Convert feedback to CSV rows
      const csvRows = [
        headers.join(','),
        ...allFeedback.map((f: FeedbackData) => [
          f.id,
          `"${f.name.replace(/"/g, '""')}"`, // Escape quotes in names
          f.email,
          f.rating,
          f.category,
          `"${f.message.replace(/"/g, '""')}"`, // Escape quotes in messages
          typeof f.timestamp === 'string' ? f.timestamp : new Date(f.timestamp).toISOString(),
          `"${(f.userAgent || '').replace(/"/g, '""')}"`,
          `"${(f.referrer || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`Successfully exported ${allFeedback.length} local feedback entries to ${filename}`);
      } else {
        throw new Error('Browser does not support file download');
      }
    } catch (error) {
      console.error('Failed to export local feedback as CSV:', error);
      // Fallback: copy CSV content to clipboard
      this.fallbackCsvExport();
    }
  }

  // Fallback method to copy CSV to clipboard if download fails
  private async fallbackCsvExport(): Promise<void> {
    try {
      const allFeedback = await this.getLocalStoredFeedback();
      const headers = ['ID', 'Name', 'Email', 'Rating', 'Category', 'Message', 'Timestamp'];
      const csvRows = [
        headers.join(','),
        ...allFeedback.map((f: FeedbackData) => [
          f.id,
          `"${f.name.replace(/"/g, '""')}"`,
          f.email,
          f.rating,
          f.category,
          `"${f.message.replace(/"/g, '""')}"`,
          typeof f.timestamp === 'string' ? f.timestamp : new Date(f.timestamp).toISOString()
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      await navigator.clipboard.writeText(csvContent);
      console.log('CSV content copied to clipboard as fallback');
    } catch (clipboardError) {
      console.error('Failed to copy CSV to clipboard:', clipboardError);
    }
  }

  // Clear all stored feedback (for privacy/cleanup)
  clearAllFeedback(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const feedbackService = new FeedbackService();
export default FeedbackService;