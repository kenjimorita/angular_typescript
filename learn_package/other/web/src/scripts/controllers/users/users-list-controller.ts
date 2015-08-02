/// <reference path="../../vendor_def/tsd.d.ts" />
/// <reference path="../../services/common/routes.ts" />

module controllers.users.list {

  import UserOverview = stanby.models.users.UserOverview;
  import UserListResponse = stanby.models.users.UserListResponse;


  export class UserList {
    searchParam: string = '';
    users: UserOverview[];
    usersForView: UserOverview[];
    isFiltered: boolean = true;
    status: string;

    constructor(
      public enums: sb.Enums,
      private routes: st.Routes,
      private $scope
    ) {}

    init(): void {
      this.routes.users.list(status, '')
        .success((data: UserListResponse) => {
          this.users = data.users;
          this.usersForView = this.users;
          this.watchSearchParam();
        });
    }

    watchSearchParam(): void {
      this.$scope.$watch(() => {
        return this.searchParam;
      }, (newValue, oldValue) => {
        this.filterBySearch(newValue);
      });
    }

    filterBySearch(searchParam): void {
      this.usersForView = _.filter(this.users, (user) => {
        var
          regex = new RegExp(searchParam);

        if (regex.test(user.fullName) || regex.test(user.email) || regex.test(user.title)) {
          return user;
        }
      });
    }

    filter(): void {
      this.isFiltered = !this.isFiltered;
      this.status = this.isFiltered ? null : "DIS";
      this.routes.users.list(this.status, '')
        .success(data => {
          this.usersForView = data.users;
        });
    }

    hasRole(roles, checkString): boolean {
      return _.contains(roles, checkString);
    }
  }
}
