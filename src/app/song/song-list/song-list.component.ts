import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SongService} from '../../service/song.service';
import {Song} from '../../model/song';
import {AddSongToPlaying} from '../../service/add-song-to-playling.service';
import {Page} from '../../model/page';
import {AddSongToPlaylistComponent} from '../../playlist/add-song-to-playlist/add-song-to-playlist.component';
import {PlaylistService} from '../../service/playlist.service';
import {Playlist} from '../../model/playlist';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SongListComponent implements OnInit, OnDestroy {
  private pageNumber: number;
  private pageSize: number;
  private pages: Page[] = [];
  private message;
  private songList: Song[];
  private isDisable: boolean;
  private subscription: Subscription = new Subscription();
  playlistList: Playlist[];
  @ViewChild(AddSongToPlaylistComponent, {static: false}) child: AddSongToPlaylistComponent;

  constructor(private songService: SongService, private addSongToPlaying: AddSongToPlaying, private playlistService: PlaylistService) { }

  ngOnInit() {
    this.subscription.add(this.songService.getSongList().subscribe(
      result => {
        if (result != null) {
          this.songList = result.content;
          this.songList.forEach((value, index) => {
            this.songList[index].isDisabled = false;
          });
          this.pageNumber = result.pageable.pageNumber;
          this.pageSize = result.pageable.pageSize;
          this.pages = new Array(result.totalPages);
          for (let i = 0; i < this.pages.length; i++) {
            this.pages[i] = {pageNumber: i};
          }
          this.isDisable = false;
        }
      }, error => {
        this.isDisable = true;
        this.message = 'Cannot retrieve song list. Cause: ' + error.songsMessage;
      }
    ));
  }

  addToPlaying(song) {
    song.isDisabled = true;
    this.addSongToPlaying.emitChange(song);
  }

  goToPage(i) {
    this.subscription.add(this.songService.getSongListPage(i).subscribe(
      result => {
        if (result != null) {
          window.scroll(0, 0);
          this.songList = result.content;
          this.songList.forEach((value, index) => {
            this.songList[index].isDisabled = false;
          });
          this.pageNumber = result.pageable.pageNumber;
          this.pageSize = result.pageable.pageSize;
          this.pages = new Array(result.totalPages);
          for (let j = 0; j < this.pages.length; j++) {
            this.pages[j] = {pageNumber: i};
          }
          this.isDisable = false;
        }
      }, error => {
        this.isDisable = true;
        this.message = 'Cannot retrieve song list. Cause: ' + error.songsMessage;
      }
    ));
  }

  refreshPlaylistList(songId) {
    this.subscription.add(this.playlistService.getPlaylistListToAdd(songId).subscribe(
      result => {
        this.playlistList = result;
      }, error => {
        console.log(error);
      }
    ));
  }

  likeSong(songId: number) {
    this.subscription.add(this.songService.likeSong(songId).subscribe(
      () => {
        console.log('Liked!');
        this.subscription.add(this.goToPage(this.pageNumber));
      }, error => {
        console.log(error);
      }
    ));
  }

  unlikeSong(songId: number) {
    this.songService.unlikeSong(songId).subscribe(
      () => {
        console.log('Unliked!');
        this.subscription.add(this.goToPage(this.pageNumber));
      }, error => {
        console.log(error);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
