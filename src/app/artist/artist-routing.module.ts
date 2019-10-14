import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ArtistComponent} from './artist/artist.component';
import {ArtistListComponent} from './artist-list/artist-list.component';
import {ArtistDetailComponent} from './artist-detail/artist-detail.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path:  '',
    component:  ArtistComponent,
    children: [
      {
        path:  'list',
        component:  ArtistListComponent
      },
      {
        path:  'detail/:id',
        component:  ArtistDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtistRoutingModule { }
