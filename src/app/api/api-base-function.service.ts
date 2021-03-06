import { Injectable } from '@angular/core';
import { ApiObject } from './apiobject';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseFunctionService {

  constructor(private http: Http, private snackBar: MatSnackBar) { }

    /**
     * extracts the url from a given object.
     *
     * @param url url to be extracted
     */
    private extractUrl(url: string | ApiObject): string {
        if (typeof url === 'string' || url instanceof String) {
            return this.prepareRelativeUrl(url as string);
        }
        if (url.hasOwnProperty('url')) {
            url = url._links;
        }
        return this.prepareRelativeUrl(url as string);
    }

    /**
     * takes an url and transforms a relative url to an absolute url.
     *
     * @param url url to be prepared
     */
    private prepareRelativeUrl(url: string): string {
        if (url.startsWith('http')) {
            return url;
        }

        // absolute url prefix
        let url_string: string = environment.settings.api;

        // remove tailing '/'
        if (url_string.endsWith('/')) {
            url_string = url_string.slice(0, url_string.length - 1);
        }

        // relative part of the url
        // append tailing '/', specific exception for swagger json (does not work with tailing /)
        if (!url.endsWith('/') && !url.endsWith('api-docs')) {
            if ((url.lastIndexOf('.') < 0) || (url.lastIndexOf('/') > url.lastIndexOf('.'))) {
                url = url + '/';
            }
        }

        // combine absolute and relative parts
        if (url.startsWith('/')) {
            return url_string + url;
        } else {
            return url_string + '/' + url;
        }
    }

    /**
     * Creates a request header
     *
     * @param token authorization token
     * @param mimetypeJSON application/json, default: true
     */
    private headers(token?: string, mimetypeJSON: boolean = true): RequestOptions {
        const headers = new Headers();
        if (mimetypeJSON) {
            headers.append('Content-Type', 'application/json');
        }
        if (token != null) {
            headers.append('Authorization', 'Bearer ' + token);
        }

        return new RequestOptions({ headers: headers });
    }


    /**
     * Takes a caught error and displays it in a snack bar.
     *
     * @param error the error object which was caught
     * @param httpVerb the http verb from the method, where the error occured (e.g. GET)
     */
    private showError = (error, httpVerb) => {
        if (error.hasOwnProperty('_body')) {
            try {
                // handling for defined error messagges
                const message = JSON.parse(error._body).message;
                const path = JSON.parse(error._body).path;

                this.snackBar.open('An error occured in ' + httpVerb + ' ' + path + ': ' + message, 'Ok', {
                    duration: 0,
                });
            } catch (e) {
                // generic handling for errors
                console.error(e);
                this.snackBar.open('An error occured in a ' + httpVerb + ' Method. The error could not be handled correctly. ' +
                    'See the console for details.', 'Ok', {
                        duration: 0,
                    });
            }
        }
        return throwError(error);
    }

    /**
     * generic get method
     *
     * @param url url of the requested endpoint
     * @param params option parameters (optional)
     */
    get<T>(url: string | ApiObject, params?): Observable<T> {
        url = this.extractUrl(url);

        const options = this.headers();
        if (params != null) {
            options.params = params;
        }

        const request = this.http.get(url, options).pipe(
            catchError((error) => this.showError(error, 'GET')),
            map((res: Response) => {
                return res.json();
            }));

        return request;
    }

    /**
     * generic post method
     *
     * @param url url of the requestes endpoint
     * @param data payload for the body
     * @param isJson specifiy if the payload is json, default: true
     */
    post<T>(url: string | ApiObject, data, isJson = true): Observable<T> {
        url = this.extractUrl(url);
        let tempData = data;
        if (data != null) {
            if (isJson) {
                tempData = JSON.stringify(tempData);
            }
        }
        return this.http.post(url, tempData, this.headers())
            .pipe(
                catchError((error) => this.showError(error, 'POST')),
                map((res: Response) => {
                    if (res.hasOwnProperty('_body')) {
                        if ((res as any)._body == null || (res as any)._body.length < 1) {
                            // handle empty results
                            return undefined;
                        }
                    }
                    return res.json();

                }));
    }

    /**
     * generic put method
     *
     * @param url url of the requested endpoint
     * @param data payload for the body
     * @param isJson specifiy if the payload is json, default: true
     */
    put<T>(url: string | ApiObject, data, isJson = true): Observable<T> {
        url = this.extractUrl(url);
        let tempData = data;
        if (isJson) {
            tempData = JSON.stringify(tempData);
        }
        return this.http.put(url, tempData, this.headers())
            .pipe(
                catchError((error) => this.showError(error, 'PUT')),
                map((res: Response) => {
                    return res.json();
                }));
    }

    /**
     * generic delete method
     *
     * @param url url of the requested endpoint
     */
    delete<T>(url: string | ApiObject): Observable<T> {
        url = this.extractUrl(url);

        return this.http.delete(url, this.headers())
            .pipe(
                catchError((error) => this.showError(error, 'DELETE')),
                map((res: Response) => {

                    // provide user feed back
                    this.snackBar.open('Element deleted successfully.', 'Ok', {
                        duration: 5000,
                    });

                    if (res.hasOwnProperty('_body')) {
                        if ((res as any)._body == null || (res as any)._body.length < 1) {
                            // handle empty results
                            return undefined;
                        }
                    }
                    return res.json();
                }));
    }

    /**
     * generic delete method
     *
     * @param url url of the requested endpoint
     */
    patch<T>(url: string | ApiObject, body, params?): Observable<T> {
      url = this.extractUrl(url);

      const options = this.headers();
        if (params != null) {
            options.params = params;
        }

      return this.http.patch(url, body, options)
      .pipe(
        catchError((error) => this.showError(error, 'PATCH')),
        map((res: Response) => {
            return res.json();
        }));
  }
}
