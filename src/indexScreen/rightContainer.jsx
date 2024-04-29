import { useEffect, useRef, useState } from "react";
import { Image, Text, View, Dimensions, ImageBackground } from "react-native";
import styled from "styled-components";
import { d, partida } from "../utils";
import Temp from "../components/temporizador";

const JugadorInfoCont = styled.View`
    align-items: center;
    justify-content: center;
    width: 50%;
    height: ${d("w", 6)}px;
    position:absolute;
    background-color: ${ p=>p.turno ? "rgba(0, 168, 255, 0.5)" : "transparent"};
    left: ${p => (p.i == 1 || p.i == 3) ? "50%" : 0};
    top: ${p => p.i < 2 ? 0 : d("w", 6)}px;
    border-left-color: ${p => (p.i == 1 || p.i == 3) ? "#fff" : (p.turno && (p.i == 0 || p.i == 2)) ? "#fff" : "transparent"};
    border-bottom-color: ${p => p.i < 2 ? "#fff" : (p.turno && p.i > 1) ? "#fff" : "transparent"};
    border-top-color: ${p => (p.turno && (p.i == 0 || p.i == 1)) ? "#fff" : "transparent"};
    border-right-color: ${p => (p.turno && (p.i == 1 || p.i == 3)) ? "#fff" : "transparent"};
    border-width: 1px;
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

export function TemporizadorTirar ({seg}){

    const [temp, setTemp] = useState(seg || 7);

    useEffect(()=>{
        const interval = setInterval(()=>{
            setTemp(e=>{e == 1 && clearInterval(interval); return e-1});
        }, 1000);
    }, []);

    return (
        <Text style={{position:"absolute", color:"#ffc400", fontWeight:"bold", fontSize:d("w", 4)}} >{temp}</Text>
    );
}

export default function RightContainer ({infoPartida}){

    return (
        <View style={{ width: "25%", alignItems:"center", height: "100%" }}>
            <View style={{height:d("w", 10), alignItems:"center", justifyContent:"center", width:"85%", borderRadius:5, marginTop:d("w", 1),}}>
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
                        <JugadorInfoCont key={i} i={i} turno={infoPartida.turno === i}>
                            <Text style={{color:"#fff", opacity:infoPartida.turno == i ? 0.6 : 1, fontWeight:500, fontSize:d("w", 1.6)}}>{infoPartida.mode == "local" ? "Jugador "+(i+1) : j.username}</Text> 
                            <Text style={{color:"#fff", opacity:infoPartida.turno == i ? 0.6 : 1, fontSize: d("w", 1.3)}}>Fichas: {j.cantidadFichas}</Text>
                            {(infoPartida.turno == i && !infoPartida.resetTempTirar) && <TemporizadorTirar />}
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