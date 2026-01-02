export interface OTPConfig{
    baseUrl: string;
    responseParams:{
        fromPlace: [number, number];
        toPlace: [number, number];       
        time: string;                    
        date: string;                    
        mode: string;                    
        maxWalkDistance: number;
        arriveBy: boolean;
        wheelchair: boolean;
        locale: string;

    }
}
