# Discord-Notifier

This project was spun off from [D2-Vendor-Alert](https://github.com/Chase-Ehlert/D2-Vendor-Alert) in an effort to explore separating the webfront service and creating a service to handle notifying users. After creating this service, I realized how common most of the API calls are between the two projects and how to run multiple services from within a monorepo. Therefore I decided to consolidate all of the code into one monorepo and instead run multiple services from it.
