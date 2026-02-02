import axios from 'axios';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

class NotificationService {
	notyf = new Notyf({ripple:true, duration: 2000, position: {x:'center', y: "top"}, dismissible: true});

    success(message: string){
        this.notyf.success(message);
    }

    error(error: any){
        this.notyf.error(this.errorHandler(error));
    }

    // transform error from any to string
    private errorHandler(error: any): string {
        if (typeof error === 'string')
            return error;

        if (axios.isAxiosError(error)) {
            switch (error.status) {
                case 404: return 'Item not found!';
                case 403: return 'You are not welcome here...';
                default:
                    // Backend always returns { error: "..." }.
                    // Pull that string out; fall back to generic message.
                    return error.response?.data?.error
                        ?? error.response?.data?.message
                        ?? 'Something went wrong';
            }
        }

        if (typeof error === 'object')
            return error.message;

        console.log(error); // CHECK THIS!!
        
        return "Unknown error occured. Please try again...";
    }
}

export const notificationService = new NotificationService();