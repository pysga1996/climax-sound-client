import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {SongService} from '../../service/song.service';
import {Artist} from '../../model/artist';
import {Song} from '../../model/song';
import {Comment} from '../../model/comment';
import {Subscription} from 'rxjs';
import {UserProfileService} from '../../service/user-profile.service';
import {Playlist} from '../../model/playlist';
import {PlaylistService} from '../../service/playlist.service';
import {PlayingQueueService} from '../../service/playing-queue.service';
import {TranslateService} from '@ngx-translate/core';
import {finalize} from 'rxjs/operators';
import {UserProfile} from '../../model/token-response';
import {CloseDialogueService} from '../../service/close-dialogue.service';

@Component({
  selector: 'app-song-detail',
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.scss']
})
export class SongDetailComponent implements OnInit, OnDestroy {
  song: Song;
  currentUser: UserProfile;
  message: string;
  loading: boolean;
  songId: number;
  artistList: Artist[];
  playlistList: Playlist[];
  commentList: Comment[];
  commentForm: FormGroup;
  error = false;
  subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
              private authService: AuthService, private songService: SongService, private closeDialogueService: CloseDialogueService,
              private userService: UserProfileService, private playlistService: PlaylistService,
              private playingQueueService: PlayingQueueService, public translate: TranslateService) {
    this.subscription.add(this.authService.currentUser$.subscribe(
      next => {
        this.currentUser = next;
      }, error => {
        this.message = 'An error has occurred.';
        console.log(error);
      }
    ));
  }

  ngOnInit() {
    this.commentForm = this.fb.group({
      content: ['']
    });
    this.retrieveSongList();
  }

  retrieveSongList() {
    this.subscription.add(this.route.queryParams.subscribe(
      params => {
        this.songId = params.id;
        this.loading = true;
        this.subscription.add(this.songService.songDetail(this.songId)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe(
            result => {
              window.scroll(0, 0);
              this.song = result;
              this.artistList = this.song.artists;
              this.commentList = this.song.comments;
              this.checkDisabledSong(this.song);
            }, error => {
              this.message = 'An error has occurred.';
              console.log(error);
            }
          ));
      }));
  }

  onSubmit() {
    this.subscription.add(this.songService.commentSong(this.songId, this.commentForm.value).subscribe(
      () => {
        this.subscription.add(this.songService.songDetail(this.songId).subscribe(
          result => {
            this.commentForm.reset();
            this.song = result;
            this.artistList = this.song.artists;
            this.commentList = this.song.comments;
          }, error => {
            this.message = 'Cannot retrieve Song . Cause: ' + error.message;
          }
        ));
      }
    ));
  }

  addToPlaying(song: Song, event) {
    event.stopPropagation();
    this.playingQueueService.addToQueue(song);
  }

  refreshPlaylistList(song: Song) {
    this.subscription.add(this.playlistService.getPlaylistListToAdd(song.id).subscribe(
      result => {
        this.playlistList = result;
      }, error => {
        console.log(error);
      }
    ));
  }

  likeSong(song: Song, event) {
    event.stopPropagation();
    song.loadingLikeButton = true;
    this.subscription.add(this.songService.likeSong(song.id).subscribe(
      () => {
        this.subscription.add(this.songService.songDetail(song.id).subscribe(
          songDetail => {
            this.song = songDetail;
          }, error1 => {
            console.log(error1);
          }
        ));
      }, error => {
        console.log(error);
      }, () => {
        song.loadingLikeButton = false;
      }
    ));
  }

  unlikeSong(song: Song, event) {
    event.stopPropagation();
    song.loadingLikeButton = true;
    this.subscription.add(this.songService.unlikeSong(song.id).subscribe(
      () => {
        this.subscription.add(this.songService.songDetail(song.id).subscribe(
          songDetail => {
            this.song = songDetail;
          }, error1 => {
            console.log(error1);
          }
        ));
      }, error => {
        console.log(error);
      }, () => {
        song.loadingLikeButton = false;
      }
    ));
  }

  checkDisabledSong(song: Song) {
    let isDisabled = false;
    for (const track of this.playingQueueService.currentQueueSubject.value) {
      if (song.url === track.link) {
        isDisabled = true;
        break;
      }
    }
    song.isDisabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  deleteComment(commentId: number) {
    this.subscription.add(this.songService.deleteComment(commentId).subscribe(
      () => {
        const deleteAction = setTimeout(() => {
          this.retrieveSongList();
          this.closeDialogueService.emitCloseDialogue(true);
          clearTimeout(deleteAction);
        }, 1500);
      }, error => {
        this.message = 'Cannot delete comment';
        console.log(error.message);
      }
    ));
  }
}
