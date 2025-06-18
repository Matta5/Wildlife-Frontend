import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.baseUrl = 'http://localhost:7186';
    }

    async startConnection() {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${this.baseUrl}/observationHub`, {
                    withCredentials: true
                })
                .withAutomaticReconnect()
                .build();

            await this.connection.start();
            console.log('SignalR Connected!');
            return true;
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            return false;
        }
    }

    onNewObservation(callback) {
        this.connection?.on('ReceiveNewObservation', callback);
    }

    onObservationUpdated(callback) {
        this.connection?.on('ReceiveObservationUpdate', callback);
    }

    onObservationDeleted(callback) {
        this.connection?.on('ReceiveObservationDelete', callback);
    }

    removeAllListeners() {
        if (this.connection) {
            this.connection.off('ReceiveNewObservation');
            this.connection.off('ReceiveObservationUpdate');
            this.connection.off('ReceiveObservationDelete');
        }
    }

    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService(); 