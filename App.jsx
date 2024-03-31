import { useEffect, useState } from "react";
import { Image, ImageBackground, StatusBar, Text, View } from "react-native";
import styled from "styled-components";
import Motor from "./src/motor";
import { partida } from "./src/utils";
import Temp from "./src/components/temporizador";
import LeftContainer from "./src/indexScreen/leftContainer";
import RightContainer from "./src/indexScreen/rightContainer";

export default function App() {

    const [infoPartida, setInfoPartida] = useState({mode:"online", inGame:false,  cantJugadores:0, });
    
    useEffect(()=>{

        partida.set(infoPartida);

        partida.get((data)=>{
            setInfoPartida(data);
        }, "index");
    }, []);
    
    return (
        <ImageBackground source={require("./assets/images/bg.png")} style={{ flex: 1, backgroundColor: "#000", flexDirection: "row" }}>
            <StatusBar/>            
            {!infoPartida.inGame && <LeftContainer infoPartida={infoPartida} /> }
            <View style={{paddingTop:infoPartida.inGame ? 0 : "2%"}}>
                { infoPartida.inGame &&
                    <View style={{ flexDirection: "row", padding: "1%", justifyContent: "space-between", marginTop: "auto", marginBottom: "1%", borderRadius: 4, backgroundColor: "rgba(1, 1, 1, 0.1)" }}>
                        <Text style={{ color: "#fff" }}>Turno <Text style={{fontWeight:"bold"}}>Moises</Text> </Text>
                    </View>
                }
                <Motor />
            </View>
            <RightContainer infoPartida={infoPartida} />
        </ImageBackground>
    )
}