import { useRef } from "react";
import { Image, Text, View, Dimensions, ImageBackground } from "react-native";
import styled from "styled-components";
import { partida } from "../utils";
import Temp from "../components/temporizador";

const d = (e, p) => Dimensions.get("window")[e == "w" ? "width" : "height"]*p/100;

const JugadorInfoCont = styled.View`
    align-items: center;
    justify-content: center;
    width: 50%;
    height: ${d("w", 6)}px;
    position:absolute;
    left: ${p => p.left};
    top: ${p => p.top}px;
    border-left-width: ${p => p.borderLeft }px;
    border-bottom-width: ${p => p.borderBottom }px;
    border-color: #fff;
`

const TxtTitle = styled.Text`
    color:#fff;
    font-size: ${d("w", 2.3)}px;
    font-weight: bold;
    margin-bottom: ${d("w", 0.5)}px;
`;

const TitleTopCont = styled.View`
    flex-direction:row;
    width:100%;
`;
const TxtTitleTop = styled.Text`
    color:#fff;
    text-align: ${p => p.top ? "center" : "left"};
    width:50%;
    font-size: ${p => p.top ? d("w", 1.5) : d("w", 1.8)}px;
    font-weight: ${p => p.top ? 400 : "bold"};
`;

export default function RightContainer ({infoPartida}){

    return (
        <View style={{ width: "25%", alignItems:"center", height: "100%" }}>
            <View style={{height:d("w", 10), alignItems:"center", justifyContent:"center", width:"85%", borderRadius:5, marginTop:d("w", 1),}}>
                {/* <ImageBackground style={{height:"100%", width:"100%", position:"absolute", opacity:0.1}} source={require("../../assets/images/marcaAgua.png")} /> */}
                <TitleTopCont>
                    <TxtTitleTop top>Modo:</TxtTitleTop>
                    <TxtTitleTop>{infoPartida.gameMode}</TxtTitleTop>
                </TitleTopCont>
                <TitleTopCont>
                    <TxtTitleTop top>Restante:</TxtTitleTop>
                    <TxtTitleTop><Temp/></TxtTitleTop>
                </TitleTopCont>
            </View>
            <View style={{marginTop:d("w", 1), height:d("w", 16), width:"100%", alignItems:"center"}}>
                <TxtTitle>Jugadores</TxtTitle>
                <View style={{borderWidth:0, borderRadius: 2, borderColor:"#fff", height:d("w", 8), width:"80%" }}>
                    { (infoPartida.jugadores || [{username:"moi"}, {username:"moi12"}, {username:"23aavl"}, {username:"xdd._"}]).map((j, i)=>(
                        <JugadorInfoCont borderBottom={i < 2 ? 1 : 0} borderLeft={(i == 1 || i == 3) ? 1 : 0} top={i < 2 ? 0 : d("w", 6)} left={(i == 1 || i == 3) ? "50%" : 0} >
                            <Text style={{color:"#fff", fontWeight:500, fontSize:d("w", 1.6)}}>{infoPartida.mode == "local" ? "Jugador "+(i+1) : j.username}</Text> 
                            <Text style={{color:"#fff", fontSize: d("w", 1.3)}}>Fichas: {0}</Text>
                        </JugadorInfoCont>
                    ))}
                </View>
            </View>
            <View style={{height:d("w", 14), alignItems:"center", marginTop:d("w", 3)}}>
                <TxtTitle>Comodines</TxtTitle>
            </View>
        </View>
    )
}