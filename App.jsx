import { StatusBar, Text, View } from "react-native";
import Motor from "./src/motor";
import { useState } from "react";

export default function App (){

    const [config, setConfig] = useState({turnoJugadorName:"MOI11", jugadores:[{id:"MOI11", cantidadFichas:12}, {id:"MOI22", cantidadFichas:12}]});
    
    return (
        <View style={{flex:1, backgroundColor:"#000", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
            <StatusBar/>
            <Motor />
        </View>
    )
}