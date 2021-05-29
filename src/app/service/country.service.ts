import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }

  getCountryList(page: number) {
    return this.http.get<any>(`${environment.apiUrl}/country/list?page=${page}`);
  }

  deleteCountry(id: number) {
    return this.http.delete<any>(`${environment.apiUrl}/country?id=${id}`);
  }

  updateCountry(formData: FormData, id: number) {
    return this.http.put<any>(`${environment.apiUrl}/country/update?id=${id}`, formData);
  }

  createCountry(formData: FormData) {
    return this.http.post<any>(`${environment.apiUrl}/country/create`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}