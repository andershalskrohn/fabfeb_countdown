import * as vscode from 'vscode';

export interface FabFebConfig {
    targetDate: string;
    animationSpeed: 'slow' | 'normal' | 'fast';
    enabled: boolean;
    autoHideTimeout: number;
    currentMessageIndex: number;
}

export class ConfigurationManager {
    private static readonly CONFIG_SECTION = 'fabfebCountdown';
    private configurationChangeEmitter = new vscode.EventEmitter<FabFebConfig>();
    public readonly onConfigurationChanged = this.configurationChangeEmitter.event;
    
    private readonly alternatingMessages: string[] = [
        '',
        'Remember! The call for speakers close August 31!',
        '💚 #SNÆCKS 💚',
        '💚'
    ];
    
    private currentMessageIndex: number = 0;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(this.handleConfigurationChanged, this);
    }

    public getConfiguration(): FabFebConfig {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
        
        return {
            targetDate: this.validateDate(config.get<string>('targetDate', '2026-02-01')),
            animationSpeed: this.validateAnimationSpeed(config.get<string>('animationSpeed', 'normal')),
            enabled: config.get<boolean>('enabled', true),
            autoHideTimeout: this.validateTimeout(config.get<number>('autoHideTimeout', 3000)),
            currentMessageIndex: this.currentMessageIndex
        };
    }

    public getNextAlternatingMessage(targetDate: string): string {
        const daysUntil = this.calculateDaysUntil(targetDate);
        this.alternatingMessages[0] = this.formatCountdownMessage(daysUntil, targetDate);
        
        const message = this.alternatingMessages[this.currentMessageIndex];
        
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.alternatingMessages.length;
        
        console.log(`Message cycling: showing message ${this.currentMessageIndex - 1 >= 0 ? this.currentMessageIndex - 1 : this.alternatingMessages.length - 1}, next will be ${this.currentMessageIndex}`);
        
        return message;
    }

    public addAlternatingMessage(message: string): void {
        this.alternatingMessages.push(message);
        console.log(`Added new alternating message: "${message}". Total messages: ${this.alternatingMessages.length}`);
    }

    public getAllAlternatingMessages(): string[] {
        return [...this.alternatingMessages];
    }

    public resetMessageCycle(): void {
        this.currentMessageIndex = 0;
        console.log('Message cycle reset to beginning');
    }

    public calculateDaysUntil(targetDate: string): number {
        try {
            const target = new Date(targetDate);
            const now = new Date();
            
            if (isNaN(target.getTime())) {
                console.warn(`Invalid target date: ${targetDate}`);
                return 0;
            }
            
            target.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            
            const diffTime = target.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays;
        } catch (error) {
            console.error('Error calculating days until target:', error);
            return 0;
        }
    }

    public formatCountdownMessage(daysUntil: number, targetDate: string): string {
        const formattedDate = this.formatDate(targetDate);
        
        if (daysUntil > 1) {
            return `Only ${daysUntil} days left until ${formattedDate}!`;
        } else if (daysUntil === 1) {
            return `Tomorrow is the day! ${formattedDate}`;
        } else if (daysUntil === 0) {
            return `Today is the day! ${formattedDate}`;
        } else if (daysUntil === -1) {
            return `Yesterday was ${formattedDate}!`;
        } else {
            return `${formattedDate} was ${Math.abs(daysUntil)} days ago!`;
        }
    }

    private validateDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn(`Invalid date: ${dateString}, using default`);
                vscode.window.showWarningMessage(`Invalid target date: ${dateString}. Using default date.`);
                return '2026-02-01';
            }
            
            const isoDate = date.toISOString().split('T')[0];
            return isoDate;
        } catch (error) {
            console.warn(`Error parsing date: ${dateString}, using default`);
            vscode.window.showWarningMessage(`Error parsing target date: ${dateString}. Using default date.`);
            return '2026-02-01';
        }
    }

    private validateAnimationSpeed(speed: string): 'slow' | 'normal' | 'fast' {
        const validSpeeds: ('slow' | 'normal' | 'fast')[] = ['slow', 'normal', 'fast'];
        if (validSpeeds.includes(speed as 'slow' | 'normal' | 'fast')) {
            return speed as 'slow' | 'normal' | 'fast';
        }
        console.warn(`Invalid animation speed: ${speed}, using default`);
        return 'normal';
    }

    private validateTimeout(timeout: number): number {
        if (typeof timeout === 'number' && timeout >= 1000 && timeout <= 10000) {
            return timeout;
        }
        console.warn(`Invalid timeout: ${timeout}, using default`);
        return 3000;
    }

    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    private handleConfigurationChanged(event: vscode.ConfigurationChangeEvent) {
        if (event.affectsConfiguration(ConfigurationManager.CONFIG_SECTION)) {
            console.log('FabFeb configuration changed');
            const newConfig = this.getConfiguration();
            this.configurationChangeEmitter.fire(newConfig);
        }
    }

    public dispose() {
        this.configurationChangeEmitter.dispose();
    }
} 