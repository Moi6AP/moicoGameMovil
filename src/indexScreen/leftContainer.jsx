import { useRef } from "react";
import { Image, View } from "react-native";
import styled from "styled-components";
import { partida } from "../utils";

const BtnOpcion = styled.Pressable`
    padding: 5%;
    border-bottom-width:0;
    border-bottom-color: #555353;
    border-radius: 3px;
    background-color:${p => p.active ? "rgba(0, 168, 255, 1)" : "transparent"} ;
`;
const TxtBtnOpcion = styled.Text`
    color:#fff;
    font-weight: ${p => p.active ? "bold" : "normal"};
`;


export default function LeftContainer ({infoPartida}){

    function cambiarModo (modo){
        partida.set({mode:modo});
    }

    return (
        <View style={{ height: "100%", width: "25%", paddingTop: "3%", marginRight: "2%" }}>
            <Image style={{ width: "100%", height: "22%", resizeMode: "contain" }} source={require("../../assets/images/logoGame.png")} />

            <View style={{ marginTop: "8%", marginLeft: "8%", width: "80%" }}>
                <BtnOpcion active={infoPartida.mode == "online"} onPress={()=>cambiarModo("online")}>
                    <TxtBtnOpcion active={infoPartida.mode == "online"} >Online</TxtBtnOpcion>
                </BtnOpcion>
                <BtnOpcion active={infoPartida.mode == "local"} onPress={()=>cambiarModo("local")}>
                    <TxtBtnOpcion active={infoPartida.mode == "local"} >Local</TxtBtnOpcion>
                </BtnOpcion>
                <BtnOpcion active={infoPartida.mode == "tienda"} onPress={()=>cambiarModo("tienda")}>
                    <TxtBtnOpcion active={infoPartida.mode == "tienda"} >Tienda</TxtBtnOpcion>
                </BtnOpcion>
                <BtnOpcion active={infoPartida.mode == "ajustes"} onPress={()=>cambiarModo("ajustes")}>
                    <TxtBtnOpcion active={infoPartida.mode == "ajustes"} >Ajustes</TxtBtnOpcion>
                </BtnOpcion>
            </View>
        </View>
    )
}