import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/features/header/header";
import { Footer } from "./components/features/footer/footer";
import { ToastContainer } from "./ui/toast-container/toast-container";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pollfish-app');
}
