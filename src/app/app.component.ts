import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  allChamps: string[] = [];
  filteredChamps: string[] = [];
  selectedChamps: string[] = [];
  filterText: string = '';
  compositions: any[] = [];
  filteredCompositions: any[] = [];
  filteredEarlyComps: any[] = [];
  filteredMidComps: any[] = [];

  // Accordion states
  showAllEarlyComps: boolean = true;
  showFilteredCompositions: boolean = true;
  showAllMidComps: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('/compositions.json').subscribe({
      next: (response) => {
        this.allChamps = response.allChamps || [];
        this.filteredChamps = [...this.allChamps];
        this.compositions = response.compositions || [];
        this.filterEarlyComps(); // Initialize All Early Comps
        this.filterMidComps(); // Initialize All Mid Comps
        this.filterCompositions(); // Initialize Filtered Compositions
      },
      error: (error) => {
        console.error('Error loading compositions.json:', error);
      },
    });
  }

  filterEarlyComps() {
    if (this.selectedChamps.length === 0) {
      // Si no hay campeones seleccionados, mostrar todas las composiciones
      this.filteredEarlyComps = [...this.compositions];
      return;
    }

    // Filtrar las composiciones con coincidencias en `Early Comp`
    const filtered = this.compositions
      .map((comp) => {
        const matchedChamps = this.selectedChamps.filter((champ) =>
          comp.earlyComp.includes(champ)
        ).length;

        return { ...comp, matchedChamps };
      })
      .filter((comp) => comp.matchedChamps > 0); // Excluir las que no tienen coincidencias

    // Ordenar por cantidad de coincidencias
    this.filteredEarlyComps = filtered.sort(
      (a, b) => b.matchedChamps - a.matchedChamps
    );
  }

  filterMidComps() {
    if (this.selectedChamps.length === 0) {
      // Si no hay campeones seleccionados, mostrar todas las composiciones
      this.filteredMidComps = [...this.compositions];
      return;
    }

    // Filtrar las composiciones con coincidencias en `Mid Comp`
    const filtered = this.compositions
      .map((comp) => {
        const matchedChamps = this.selectedChamps.filter((champ) =>
          comp.midComp.includes(champ)
        ).length;

        return { ...comp, matchedChamps };
      })
      .filter((comp) => comp.matchedChamps > 0); // Excluir las que no tienen coincidencias

    // Ordenar por cantidad de coincidencias
    this.filteredMidComps = filtered.sort(
      (a, b) => b.matchedChamps - a.matchedChamps
    );
  }

  filterCompositions() {
    if (this.selectedChamps.length === 0) {
      this.filteredCompositions = [...this.compositions];
      return;
    }

    this.filteredCompositions = this.compositions
      .map((comp) => ({
        ...comp,
        matchedChamps: this.selectedChamps.filter((champ) =>
          comp.allChamps.includes(champ)
        ).length,
      }))
      .filter((comp) => comp.matchedChamps > 0)
      .sort((a, b) => b.matchedChamps - a.matchedChamps);
  }

  filterChamps() {
    this.filteredChamps =
      this.filterText.trim() === ''
        ? [...this.allChamps]
        : this.allChamps.filter((champ) =>
            champ.toLowerCase().includes(this.filterText.toLowerCase())
          );
  }

  selectChamp(champ: string) {
    if (!this.selectedChamps.includes(champ)) {
      this.selectedChamps.push(champ);
      this.filterEarlyComps();
      this.filterMidComps();
      this.filterCompositions();
    }
  }

  removeChamp(champ: string) {
    this.selectedChamps = this.selectedChamps.filter((c) => c !== champ);
    this.filterEarlyComps();
    this.filterMidComps();
    this.filterCompositions();
  }

  toggleSection(section: string) {
    if (section === 'allEarlyComps') {
      this.showAllEarlyComps = !this.showAllEarlyComps;
    } else if (section === 'allMidComps') {
      this.showAllMidComps = !this.showAllMidComps;
    } else if (section === 'filteredCompositions') {
      this.showFilteredCompositions = !this.showFilteredCompositions;
    }
  }

  getAllEarlyChampsGlobal(): string[] {
    const allChamps = this.compositions.flatMap((comp) => comp.earlyComp); // Combinar todos los earlyComp
    const uniqueChamps = Array.from(new Set(allChamps)); // Eliminar duplicados
    return uniqueChamps.sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
  }
}
