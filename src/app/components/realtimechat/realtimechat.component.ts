import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';


declare var navigator:any;

@Component({
  selector: 'app-realtimechat',
  templateUrl: './realtimechat.component.html',
  styleUrls: ['./realtimechat.component.scss']
})
export class RealtimechatComponent implements OnInit {
  @ViewChild('myvideo', {static: true}) myvideoInput!: ElementRef<HTMLVideoElement>;

  //@ViewChild("myvideo", { static: true })myvideoInput!: ElementRef;
  @ViewChild("peervideo",{static:true}) peervideoInput! : ElementRef<HTMLVideoElement>;
  roomname:string="";

  

  constructor(private socketioService : SocketioService,private router:Router,private route : ActivatedRoute) { 
    
  }

  ngOnInit(): void {

    this.socketioService.mymethod();
    this.route.queryParams.subscribe(params => {
      this.roomname = params['roomname'];
      this.socketioService.roomname = this.roomname;
    });
  }

  ngAfterViewInit():void{
    console.log("ngAfterViewInit this.myvideoInput ",this.myvideoInput)
    console.log("ngAfterViewInit this.peervideoInput ",this.peervideoInput)
  }

  onStart(){
    navigator.mediaDevices.getUserMedia({audio:false, video: true}).then((ms: MediaStream) => {
      console.log("in onStart then ms ",ms);
      this.socketioService.myvideoMediaStream=ms;
      const _video = this.myvideoInput.nativeElement;
      _video.srcObject = ms;
      _video.play(); 
      this.socketioService.emitFun(this.socketioService.socketEvents.READY,this.roomname);
    }).catch((err:any)=>{
      console.log("in onStart catch err ",err);
    })
  }

  onStop() {
    this.myvideoInput.nativeElement.pause();
    (this.myvideoInput.nativeElement.srcObject as MediaStream).getVideoTracks()[0].stop();
    this.myvideoInput.nativeElement.srcObject = null;
  }

  leaveroom(){
    
    this.socketioService.emitFun(this.socketioService.socketEvents.LEAVEROOM,this.roomname);
    this.router.navigate(["/chatroom"]);
  }

  ngOnDestroy() {
    let temp = (this.myvideoInput.nativeElement.srcObject as MediaStream);

    if(temp){
      temp.getVideoTracks()[0].stop();
    }
    else{
      console.log("nothing to destroy")
    }
    
  }
}
