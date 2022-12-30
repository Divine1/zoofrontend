import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { RealtimechatComponent } from './components/realtimechat/realtimechat.component';

const routes: Routes = [
  {
    path : "chatroom",component : ChatRoomComponent
  },
  {
    path : "realtimechat", component:RealtimechatComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
