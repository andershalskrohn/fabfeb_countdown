import * as vscode from 'vscode';
import { WebviewManager } from './webview/WebviewManager';
import { ConfigurationManager } from './config/ConfigurationManager';

let webviewManager: WebviewManager | undefined;
let configManager: ConfigurationManager | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('FabFeb Countdown extension is now active!');

    // Initialize configuration manager
    configManager = new ConfigurationManager();
    
    // Initialize webview manager
    webviewManager = new WebviewManager(context, configManager);

    // Register command to show countdown
    const showCountdownCommand = vscode.commands.registerCommand('fabfeb.showCountdown', () => {
        try {
            webviewManager?.showCountdown();
        } catch (error) {
            console.error('Error showing countdown:', error);
            vscode.window.showErrorMessage('Failed to show FabFeb countdown');
        }
    });

    // Auto-start the sprite on activation
    // TODO: Make this configurable in future milestones
    try {
        console.log('Creating webview panel...');
        webviewManager.createWebviewPanel();
        console.log('Webview panel created successfully');
        
        // Show a notification that the extension is active
        vscode.window.showInformationMessage('🍩 FabFeb Countdown is now active! Look for the donut sprite in the webview panel.');
    } catch (error) {
        console.error('Error creating webview panel:', error);
        vscode.window.showErrorMessage('Failed to create FabFeb Countdown webview: ' + error);
    }

    context.subscriptions.push(showCountdownCommand);
}

export function deactivate() {
    console.log('FabFeb Countdown extension is being deactivated');
    webviewManager?.dispose();
    configManager?.dispose();
    webviewManager = undefined;
    configManager = undefined;
} 