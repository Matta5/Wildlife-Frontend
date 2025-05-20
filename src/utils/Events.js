// utils/Events.js
import { EventRegister } from 'react-native-event-listeners';

// Helper functies voor het werken met app-brede events
export const AppEvents = {
    // Event types
    AUTH_ERROR: 'AUTH_ERROR',
    TOKEN_REFRESHED: 'TOKEN_REFRESHED',

    // Emit een event
    emit: (eventName, data) => {
        EventRegister.emit(eventName, data);
    },

    // Voeg een listener toe en retourneer de listener ID
    addListener: (eventName, callback) => {
        return EventRegister.addEventListener(eventName, callback);
    },

    // Verwijder een listener op basis van ID
    removeListener: (listenerId) => {
        EventRegister.removeEventListener(listenerId);
    }
};

export default AppEvents;