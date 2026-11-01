import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-company-list',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './company-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyList {}
