import { ImageBackground, Pressable, Text, View } from "react-native"
import styled from "styled-components"
import { d } from "../utils";

const TxtCantJugadores = styled.Text`
    color:#fff;
    font-size: ${d("w", 1.1)}px;
`;
const TxtTitleItemGameMode = styled.Text`
    color:#fff;
    font-size: ${d("w", 1.4)}px;
    font-weight: bold;
`;
const ItemGameModeCont = styled.Pressable`
    align-items:center;
    width: 40%;
    border-radius: 8px;
    height: 100%;
    justify-content: center;
    border-color: #dddddd;
    border-width: 1.5px;
`;

const Contenedor2ItemGameMode = styled.View`
    flex-direction:row;
    justify-content: space-evenly;
    align-items: center;
    width:100%;
    height:25%;
    margin-bottom: 8px;
`;

export default function ElegirGameMode ({setClose}){
    return (
        <View style={{position:"absolute", width:"100%", height:"100%"}}>
            <Pressable onPress={()=>setClose(false)} style={{flex:1, backgroundColor:"rgba(0, 0, 0, 0.3)"}} />
            <View style={{position:"absolute", alignItems:"center", justifyContent:"center", borderRadius:15, top:"20%", left:"32.5%", backgroundColor:"#fff", width:"35%", height:"60%"}}>
                <ImageBackground style={{height:"100%", width:"100%", position:"absolute", opacity:0.07}} source={require("../../assets/images/marcaAgua.png")} />
                <Text style={{fontWeight:"bold", marginBottom:"5%"}}>Elije modo de juego</Text>
                <Contenedor2ItemGameMode>
                    <ItemGameModeCont style={({pressed})=>[{backgroundColor:pressed ? "#df6347" : "#E87056"}]} onPress={()=>setClose(undefined, "1vs1")}>
                        <TxtTitleItemGameMode>1vs1</TxtTitleItemGameMode>
                    </ItemGameModeCont>
                    <ItemGameModeCont style={({pressed})=>[{backgroundColor:pressed ? "#427fda" : "#5690E8"}]} onPress={()=>setClose(undefined, "3jugadores")}>
                        <TxtCantJugadores>3 jugadores</TxtCantJugadores>
                        <TxtTitleItemGameMode>Todos contra todos</TxtTitleItemGameMode>
                    </ItemGameModeCont>
                </Contenedor2ItemGameMode>

                <Contenedor2ItemGameMode>
                    <ItemGameModeCont style={({pressed})=>[{backgroundColor:pressed ? "#8144d6" : "#9256E8"}]} onPress={()=>setClose(undefined, "4jugadores")}>
                        <TxtCantJugadores>4 jugadores</TxtCantJugadores>
                        <TxtTitleItemGameMode>Todos contra todos</TxtTitleItemGameMode>
                    </ItemGameModeCont>
                    <ItemGameModeCont style={({pressed})=>[{backgroundColor:pressed ? "#e6b103" : "#FFC300"}]} onPress={()=>setClose(undefined, "2vs2")}>
                        <TxtCantJugadores>4 jugadores</TxtCantJugadores>
                        <TxtTitleItemGameMode>2vs2</TxtTitleItemGameMode>
                    </ItemGameModeCont>
                </Contenedor2ItemGameMode>
            </View>
        </View>
    )
}