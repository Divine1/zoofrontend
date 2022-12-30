import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';



declare function io(url : any,options : any):any;


@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket:any;

  isCreator:boolean=false;
  ICEServers:any = {
    iceServers : [
      {
        urls: "stun:stun.services.mozilla.com",

      },
      {
        urls : "stun:stun1.l.google.com:19302"
      }
    ]
  }

  myvideoMediaStream!:MediaStream;
  peervideoInput! : ElementRef<HTMLVideoElement>;
  roomname :string="";
  rtcPeerConnection:RTCPeerConnection | undefined;
  receivedMessageSubject = new Subject<any>();
  public socketEvents:any = {
    "JOINROOM" : "joinroom",
    "LEAVEROOM" : "leaveroom",
    "JOINED" : "joined",
    "READY" : "ready",
    "CANDIDATE" : "candidate",
    "OFFER" : "offer",
    "ANSWER" : "answer"
  }
  constructor() { 
    console.log("in SocketioService constructor()")

    this.socket = io("http://localhost:3000/",{});

    this.socket.on("broadcastMessage",(data:any)=>{
      console.log("broadcastMessage data ",data);
      //this.receivedMessageSubject.next(data);
    })


    this.socket.on(this.socketEvents.JOINED,(data:any)=>{
      console.log("ON this.socketEvents.JOINED data ",data);

      if(data.isroomexisting){
        this.isCreator = false;
      }
      else{
        this.isCreator = true;
      }
      console.log("ON this.socketEvents.JOINED data ",data," this.isCreator ",this.isCreator);
      //this.receivedMessageSubject.next(data);
    })


    this.socket.on(this.socketEvents.READY,(data:any)=>{
      console.log("ON this.socketEvents.READY data ",data);

      if(this.isCreator ){
        this.rtcPeerConnection= new RTCPeerConnection(this.ICEServers);

        this.rtcPeerConnection.onicecandidate = this.OnicecandidateFunction;
        this.rtcPeerConnection.ontrack= this.OnTrackFunction;

        //0 represents audio track
        this.rtcPeerConnection.addTrack(this.myvideoMediaStream.getTracks()[0],this.myvideoMediaStream);
        //1 represents video track
        this.rtcPeerConnection.addTrack(this.myvideoMediaStream.getTracks()[1],this.myvideoMediaStream);

        this.rtcPeerConnection.createOffer().then((offer:any)=>{
          console.log("offer success ",offer);
          console.log("setting local description for creator")
          this.rtcPeerConnection?.setLocalDescription(offer);
          this.emitFun(this.socketEvents.OFFER,offer,this.roomname);
        }).catch((err:any)=>{
          console.log("offer err ",err);
        })  
      }
      //this.receivedMessageSubject.next(data);
    })
    this.socket.on(this.socketEvents.CANDIDATE,(candidate:any)=>{
      console.log("ON this.socketEvents.CANDIDATE data ",candidate);
      const iceCandidate = new RTCIceCandidate(candidate);
      this.rtcPeerConnection?.addIceCandidate(iceCandidate);
      //this.receivedMessageSubject.next(data);
    })
    this.socket.on(this.socketEvents.OFFER,(offer:any)=>{
      console.log("ON this.socketEvents.OFFER offer ",offer);
      //this.receivedMessageSubject.next(data);

      if(!this.isCreator ){
        this.rtcPeerConnection= new RTCPeerConnection(this.ICEServers);

        this.rtcPeerConnection.onicecandidate = this.OnicecandidateFunction;
        this.rtcPeerConnection.ontrack= this.OnTrackFunction;

        //0 represents audio track
        this.rtcPeerConnection.addTrack(this.myvideoMediaStream.getTracks()[0],this.myvideoMediaStream);
        //1 represents video track
        this.rtcPeerConnection.addTrack(this.myvideoMediaStream.getTracks()[1],this.myvideoMediaStream);
        
        this.rtcPeerConnection.setRemoteDescription(offer);
        console.log("setting remote description for non-creator")
        this.rtcPeerConnection.createAnswer().then((answer:any)=>{
          console.log("answer success ",answer);
          this.rtcPeerConnection?.setLocalDescription(answer);
          console.log("setting local description for non-creator")

          this.emitFun(this.socketEvents.ANSWER,answer,this.roomname);
        }).catch((err:any)=>{
          console.log("offer err ",err);
        })  
      }
      



    })
    this.socket.on(this.socketEvents.ANSWER,(answer:any)=>{
      console.log("ON this.socketEvents.ANSWER answer ",answer);

      if(this.isCreator){
        console.log("setting remote description for creator")
        this.rtcPeerConnection?.setRemoteDescription(answer);
      }
      else{
        console.log("not setting remote description for non-creator")
      }
      
      //this.receivedMessageSubject.next(data);
    })
  }
  

  setPeervideoInput(peervideoInputArg:ElementRef<HTMLVideoElement>){
    this.peervideoInput = peervideoInputArg;
  }
  emitFun(event:any,data:any,data1:any = null){
    this.socket.emit(event,data,data1);
  }
  mymethod(){
    console.log("in SocketioService mymethod()")
  }

  OnicecandidateFunction(event:any){
    console.log("in OnicecandidateFunction event ",event," this.roomname ",this.roomname);
    this.emitFun(this.socketEvents.CANDIDATE,event.candidate,this.roomname)
  }

  OnTrackFunction(event:any){
    console.log("in OnTrackFunction event ",event," this.roomname ",this.roomname);
    const _video = this.peervideoInput.nativeElement;
    _video.srcObject = event.streams[0];
    _video.play(); 
  }
}
