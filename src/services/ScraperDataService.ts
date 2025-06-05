import { StudentData } from '../types/types';
import { transformData } from '../utils/dataTransformer';

// Import the JSON files directly
import mathAcademyData from '../scrapers/mathacademyscraper/student_data.json';

interface MembeanHistoricalData {
  [date: string]: any;
}

class ScraperDataService {
  private static instance: ScraperDataService;
  private lastUpdate: Date = new Date(0);
  private cachedData: StudentData[] | null = null;
  private cachedHistoricalData: MembeanHistoricalData = {};
  private subscribers: ((data: StudentData[]) => void)[] = [];
  private errorSubscribers: ((error: Error) => void)[] = [];
  private updateIntervalMs = 5000; // 5 seconds
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): ScraperDataService {
    if (!ScraperDataService.instance) {
      ScraperDataService.instance = new ScraperDataService();
    }
    return ScraperDataService.instance;
  }

  public async startPolling(): Promise<void> {
    if (this.intervalId) {
      return;
    }
    
    // Do initial check before starting the interval
    await this.checkForUpdates();
    
    this.intervalId = setInterval(() => {
      this.checkForUpdates();
    }, this.updateIntervalMs);
  }

  public stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const data = await this.fetchLatestData();
      this.lastUpdate = new Date();
      this.cachedData = data;
      this.notifySubscribers(data);
    } catch (error) {
      console.error('Error checking for updates:', error);
      this.notifyErrorSubscribers(error as Error);
    }
  }

  // Fetch the latest Membean data dynamically
  private async fetchLatestMembeanData(): Promise<any> {
    const response = await fetch('/data/membean_data_latest.json');
    if (!response.ok) throw new Error('Failed to fetch latest Membean data');
    return response.json();
  }

  private async fetchLatestAlphaReadData(): Promise<any> {
    const response = await fetch('/data/alpharead_student_data_latest.json');
    if (!response.ok) throw new Error('Failed to fetch latest AlphaRead data');
    return response.json();
  }

  public async getMembeanDataForToday() {
    return this.fetchLatestMembeanData();
  }

  public async getMembeanDataForDate(date: string): Promise<any> {
    // Only support latest for now
    return this.fetchLatestMembeanData();
  }

  public async getHistoricalMembeanData(studentId: string): Promise<{
    dates: string[];
    minutes: number[];
    accuracy: string[];
    newWords: number[];
    goalMet: boolean[];
  }> {
    // Not implemented for dynamic fetch, return empty arrays
    return {
      dates: [],
      minutes: [],
      accuracy: [],
      newWords: [],
      goalMet: [],
    };
  }

  private async fetchLatestData(): Promise<StudentData[]> {
    try {
      const membeanData = await this.fetchLatestMembeanData();
      const alphaReadData = await this.fetchLatestAlphaReadData();
      // Fetch all available daily Membean JSONs for the week
      const dailyFiles = [
        '/data/membean_data_2025-05-22.json',
        '/data/membean_data_2025-05-23.json',
        '/data/membean_data_2025-05-27.json',
      ];
      const membeanDailyDataArray = await Promise.all(
        dailyFiles.map(async (file) => {
          try {
            const resp = await fetch(file);
            if (!resp.ok) return null;
            return await resp.json();
          } catch {
            return null;
          }
        })
      );
      const filteredDailyDataArray = membeanDailyDataArray.filter(Boolean);
      const transformedData = transformData(mathAcademyData, membeanData, membeanData, filteredDailyDataArray, alphaReadData);
      return transformedData;
    } catch (error) {
      console.error('Error processing data:', error);
      throw new Error('Failed to process student data');
    }
  }

  public subscribe(callback: (data: StudentData[]) => void): () => void {
    this.subscribers.push(callback);
    if (this.cachedData) {
      callback(this.cachedData);
    }
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  public subscribeToErrors(callback: (error: Error) => void): () => void {
    this.errorSubscribers.push(callback);
    return () => {
      this.errorSubscribers = this.errorSubscribers.filter(sub => sub !== callback);
    };
  }

  public unsubscribe(callback: (data: StudentData[]) => void): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  public unsubscribeFromErrors(callback: (error: Error) => void): void {
    this.errorSubscribers = this.errorSubscribers.filter(sub => sub !== callback);
  }

  private notifySubscribers(data: StudentData[]): void {
    this.subscribers.forEach(callback => callback(data));
  }

  private notifyErrorSubscribers(error: Error): void {
    this.errorSubscribers.forEach(callback => callback(error));
  }
}

export default ScraperDataService; 