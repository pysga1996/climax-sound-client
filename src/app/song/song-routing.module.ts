import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SongComponent} from './song/song.component';
import {SongListComponent} from './song-list/song-list.component';
import {UploadSongComponent} from './upload-song/upload-song.component';
import {EditSongComponent} from './edit-song/edit-song.component';
import {DeleteSongComponent} from './delete-song/delete-song.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path:  '',
    component:  SongComponent,
    children: [
      {
        path:  'list',
        component:  SongListComponent
      },
      {
        path:  'upload',
        component:  UploadSongComponent
      },
      {
        path:  'edit',
        component:  EditSongComponent
      },
      {
        path:  'delete',
        component:  DeleteSongComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SongRoutingModule { }
