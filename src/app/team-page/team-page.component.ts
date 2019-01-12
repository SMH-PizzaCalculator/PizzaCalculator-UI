import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../api/api.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.css']
})
export class TeamPageComponent implements OnInit, OnDestroy {

  constructor(private apiService: ApiService, private route: ActivatedRoute, ) { }

  subParam: Subscription;
  subIngredients: Subscription;
  subTemplate: Subscription;

  teamName: string;

  ingredients: any;

  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  openDialog(): void {

  }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.teamName = params['teamName'];
    });


    this.subIngredients = this.apiService.getIngredients().subscribe(val => {
      this.ingredients = val;
    });

    this.subTemplate = this.apiService.getTemplates().subscribe(val => {
      console.log(val);
    });

  }

  ngOnDestroy() {
    this.unsubscribe(this.subParam);
    this.unsubscribe(this.subIngredients);
  }

  unsubscribe(subscription: Subscription) {
    if (subscription != null) {
      subscription.unsubscribe();
    }
  }

}
