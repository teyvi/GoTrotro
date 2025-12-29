import { useEffect, useState } from "react";

export const useDebounce = <T>(value:T, delay: number = 1500) =>{
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const timeoutHandler = setTimeout(() => {
            setDebounced(value);
        }, delay)
return ( )=> clearTimeout(timeoutHandler);
    },[value, delay])
    return debounced;
}