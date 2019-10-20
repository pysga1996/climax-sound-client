import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../model/user';
import {Artist} from '../../model/artist';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {ArtistService} from '../../service/artist.service';
import {SongService} from '../../service/song.service';
import {Subscription} from 'rxjs';
import {Song} from '../../model/song';
import {Page} from '../../model/page';
import {PlayingQueueService} from '../../service/playing-queue.service';
import {PlaylistService} from '../../service/playlist.service';
import {Playlist} from '../../model/playlist';
import {UserService} from '../../service/user.service';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss']
})
export class ArtistDetailComponent implements OnInit, OnDestroy {
  currentUser: User;
  artist: Artist;
  artistId: number;
  message: string;
  first: boolean;
  last: boolean;
  pageNumber = 0;
  pageSize: number;
  loading1: boolean;
  loading2: boolean;
  loading3: boolean;
  loadingButton: boolean;
  totalPages: number;
  songList: Song[] = [];
  playlistList: Playlist[] = [];
  subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
              private authService: AuthService, private artistService: ArtistService,
              private songService: SongService, private playlistService: PlaylistService,
              private playingQueueService: PlayingQueueService, private userService: UserService) {
    this.userService.currentUser.subscribe(
      currentUser => {
        this.currentUser = currentUser;
      }
    );
  }

  ngOnInit() {
    this.subscription.add(this.route.queryParams.subscribe(
      params => {
        this.loading1 = true;
        this.artistId = params.id;
        this.subscription.add(this.artistService.artistDetail(this.artistId).subscribe(
          result => {
            window.scroll(0, 0);
            this.artist = result;
          }, (error) => {
            console.log(error);
          }, () => {
            this.loading1 = false;
          }
        ));
        this.loading2 = true;
        this.subscription.add(this.artistService.getSongListOfArtist(this.artistId, this.pageNumber).subscribe(
          result1 => {
            if (result1 != null) {
              this.totalPages = result1.totalPages;
              // tslint:disable-next-line:prefer-for-of
              for (let i = 0; i < result1.content.length; i++) {
                this.songList.push(result1.content[i]);
              }
            }
          }, error => {
            this.message = 'Cannot retrieve Playlist . Cause: ' + error.message;
          }, () => {
            this.loading2 = false;
          }
        ));
      }
    ));
  }

  onScroll() {
    this.loading3 = true;
    this.pageNumber = ++this.pageNumber;
    if (this.pageNumber < this.totalPages) {
      this.subscription.add(this.artistService.getSongListOfArtist(this.artistId, this.pageNumber).subscribe(
        result => {
          if (result != null) {
            this.totalPages = result.totalPages;
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < result.content.length; i++) {
              this.songList.push(result.content[i]);
            }
            this.songList.forEach((value, index) => {
              this.songList[index].isDisabled = false;
            });
            this.first = result.first;
            this.last = result.last;
            this.pageNumber = result.pageable.pageNumber;
            this.pageSize = result.pageable.pageSize;
          }
        }, error => {
          this.message = 'Cannot retrieve song list. Cause: ' + error.songsMessage;
        }, () => {
          this.loading3 = false;
        }
      ));
    } else {
      this.pageNumber = --this.pageNumber;
    }
  }

  addToPlaying(song: Song) {
    this.playingQueueService.addToQueue({
      title: song.title,
      link: song.url
    });
  }

  refreshPlaylistList(songId: number) {
    this.subscription.add(this.playlistService.getPlaylistListToAdd(songId).subscribe(
      result => {
        this.playlistList = result;
      }, error => {
        console.log(error);
      }
    ));
  }

  refreshSong(id: number, index: number) {
    this.loadingButton = true;
    this.subscription.add(this.songService.songDetail(id).subscribe(
      result => {
        this.songList[index] = result;
      }, error => {
        console.log(error);
      }, () => {
        this.loadingButton = false;
      }
    ));
  }

  likeSong(song: Song, index: number) {
    this.loadingButton = true;
    this.subscription.add(this.songService.likeSong(song.id).subscribe(
      () => {
        this.subscription.add(this.refreshSong(song.id, index));
      }, error => {
        console.log(error);
      }, () => {
        this.loadingButton = false;
      }
    ));
  }

  unlikeSong(song: Song, index: number) {
    this.loadingButton = true;
    this.songService.unlikeSong(song.id).subscribe(
      () => {
        this.subscription.add(this.refreshSong(song.id, index));
      }, error => {
        console.log(error);
      }, () => {
        this.loadingButton = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
