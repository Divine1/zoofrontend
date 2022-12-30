import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';



@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {


  @ViewChild("roomname",{static:true}) roomnameInput : ElementRef | undefined;

  
  constructor(private router:Router, private socketioService : SocketioService) { }

  ngOnInit(): void {

  }

  join(){
    console.log("ChatRoomComponent join()")
    let roomname = this.roomnameInput?.nativeElement.value;
    console.log("roomname ",roomname);

    if(roomname != null && roomname.length > 2){
      this.socketioService.emitFun(this.socketioService.socketEvents.JOINROOM,roomname);
      this.router.navigate(["/realtimechat"],{queryParams: {roomname : roomname}})
    }
    
  }
}
