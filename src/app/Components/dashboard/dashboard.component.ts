import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PostDTO } from 'src/app/Models/post.dto';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  posts!: PostDTO[];
  likes!: number;
  dislikes!: number;

  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.loadPosts();
  }

  ngOnInit(): void {
    
  }

  private async loadPosts(): Promise<void> {
    // TODO 2
    let errorResponse: any;
    try {
      this.posts = await this.postService.getPosts();

      const totallikes =  document.body.getElementsByClassName('totalLikes');
      const totaldislikes =  document.body.getElementsByClassName('totalDislikes');
      if (totallikes && totaldislikes) {
        this.likes = 0; // Reiniciem el likes a 0 sempre que tornem a contar.
        this.dislikes = 0; // Reiniciem el likes a 0 sempre que tornem a contar.
        this.posts.forEach(post => {
          this.likes += post['num_likes'];
          this.dislikes += post['num_dislikes'];
        });
        const totallikesfinal = "" +this.likes+"";
        const totaldislikesfinal = "" +this.dislikes+"";
        totallikes[0].innerHTML = totallikesfinal;
        totaldislikes[0].innerHTML = totaldislikesfinal;
      }
      
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }
}
