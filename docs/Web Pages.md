# Web Pages

In this page we build the architecture of our app, i.e. the web pages and the connection between them.

The list of pages is

* [[home]]
* [[search_result]]
* [[ad_search]]
* [[book_info]]
* [[signup]]
* [[login]]
* [[profile]]
* [[editprofile]]
* [[mylibrary]]
* [[requestbook]]
* [[cart]]
* [[curator_panel]] #curator
* [[miners]] #curator
* [[requests]] #curator 
* [[newbook]] #curator 
* [[editbook]] #curator 
* [[books]] #curator
* [[sales]] #curator
* [[sql]] #curator

<!-- display-none pages -->

* [[logout]] #miner
* [[add2cart]] #miner
* [[tag]] #miner
* [[rate]] #miner
* [[review]] #miner
* [[remove4cart]] #miner
* [[buy]] #miner
* [[deletebook]] #curator 
* [[add_request]] #curator 
* [[turndown]] #curator 

The last several pages are **display-none** pages. That is, they don't have a HTML file that tells the app what to display, instead, they conduct some operations and then immediately redirect to other pages.

And there are two tags: #tolog and #logged, they mean different session/state the app is in. And pages and components with tag #tolog are available only when an user has not signed in; those with tag #logged are available only when an user is signed in.

The other tag #curator means pages and components that can only be visited by the curator.

## Base Components

Base components are those elements controlled by `base.html` and will show on every page. Here we list the redirected pages that these components point to

* [[home]]
* [[search_result]]
* [[login]] #tolog
* [[signup]] #tolog 
* [[profile]] #logged
* [[logout]] #logged
* [[curator]] #curator 