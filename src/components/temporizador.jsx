import { useEffect, useRef, useState } from "react"
import { Text } from "react-native";

export default function Temp ({style}){

    const [temp, setTemp] = useState({min:5, seg:0});
    const interval = useRef(false);


    useEffect(()=>{
        interval.current = setInterval(()=>{
            setTemp(e => {return { ...e, seg: e.seg == 0 ? 59 : e.seg-1 }});
        }, 1000);


        return ()=>{
            clearInterval(interval.current);
        }
    }, []);

    useEffect(()=>{
        if (temp.seg == 0 && temp.min > 0) {
            setTimeout(()=>setTemp(e => {return { ...e, min: e.min-1 }}), 1000);
        }

        if (temp.seg == 0 && temp.min == 0) {
            clearInterval(interval.current);
        }
    }, [temp]);

    return (
        <Text style={style ? style : {}}>{temp.min < 10 ? "0"+temp.min : temp.min}:{temp.seg < 10 ? "0"+temp.seg : temp.seg}</Text>
    )
}