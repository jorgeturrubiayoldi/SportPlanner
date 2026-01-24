import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  host: { 'ngSkipHydration': 'true' }
})
export class Hero {

}
