import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

// Estructura de las pantallas internas: navbar arriba y la página abajo
@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {}
