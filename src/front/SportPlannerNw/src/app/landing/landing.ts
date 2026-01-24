import { Component } from '@angular/core';
import { Navbar } from '../shared/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Features } from './components/features/features';
import { Subscriptions } from './components/subscriptions/subscriptions';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [Navbar, Hero, Features, Subscriptions, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  standalone: true
})
export class Landing {}
