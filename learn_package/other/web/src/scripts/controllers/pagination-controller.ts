/// <reference path="../vendor_def/tsd.d.ts" />
/// <reference path="../services/common/routes.ts" />

module controllers.base {

  import PagingConditions = st.response.pagination.PagingConditions;
  import QueryResultResponse = st.response.wrapper.QueryResultResponse;

  export class PaginationControllerBase<T, C extends PagingConditions> {


    /**
     * To be implemented by child class
     */
    protected setFromNormalizedParams(params: C): void {
      // Nothing by default
    }
    /**
     * To be implemented by child class
     */
    protected setFromQueryResult(res: QueryResultResponse<T>): void{
      // Nothing by default
    }
    /**
     * To be implemented by child class
     */
    protected normalizeMore(params: C): C {
      // Nothing by default
      return params;
    }

    /**
     * To be implemented by child class
     */
    protected getDefaultSearchConditions(): C {
      throw new Error('Not implemented in base controller');
    }

    /**
     * To be implemented by child class
     */
    protected doSearch(params: C): ng.IHttpPromise<QueryResultResponse<T>> {
      throw new Error('Not implemented in base controller');
    }

    /**
     * To be implemented by child class
     */
    protected transitionToSelfState(params: C): void {
      //this.$state.go('rec_interviews', conditions);
      throw new Error('Not implemented in base controller');
    }

    /**
     * To be implemented by child class
     */
    protected getNewConditions(): C {
      throw new Error('Not implemented in base controller');
    }

    /*
     * Fields
     * NOTE(kitaly): params は view からも更新できるようにして、$watch でリアクティブにすべきだった
     */
    protected defaultPageSize: number = 20;
    protected params: C; // 実際にクエリに利用される検索条件
    protected totalHits: number;
    public bsPage: any = {}; // ui-bootstrap の pagination ディレクティブ対応

    /*
     * Constructor
     */
    constructor(
      protected $state: ng.ui.IStateService,
      private $scope: ng.IScope
    ) {}

    init(): void {

      //NOTE(kitaly): Limit(ページサイズ)条件も無ければ無条件と判断 → デフォルト条件で state ごとやり直し
      if(!_.parseInt(this.$state.params['limit'])){
        var defaultSearch = this.getDefaultSearchConditions();
        defaultSearch.limit = this.defaultPageSize;
        this.transitionToSelfState(defaultSearch);

      } else { //実際の検索処理
        //NOTE(kitaly): StateParamsだと全て文字列扱いなので数値に変換
        var normalized = this.normalizeStateParams(this.$state.params);
        this.params = normalized;
        this.setFromNormalizedParams(normalized);

        //検索を実行する
        this.doSearch(this.params).success((res) => {
          this.totalHits = res.resultInfo.totalHits;
          this.setFromQueryResult(res);
          this.initBsPagination();
        });
      }
    }

    /**
     * UI-Bootstrap の pagination モジュール対応用の watch 定義
     * - bsPageWatch.currentPage -> moveToPage() (内部的に params.offset 変更)
     */
    private initBsPagination(): void {
      this.bsPage.totalItems = this.getTotalHits();
      this.bsPage.currentPage = this.getCurrentPageNum();
      this.bsPage.itemsPerPage = this.getPageSize();

      // bsPageWatch.currentPage -> moveToPage() (内部的に params.offset 変更)
      this.$scope.$watch(
        () => { return this.bsPage.currentPage; },
        (newVal, oldVal) => {
          if(newVal != oldVal && newVal > 0) this.moveToPage(newVal);
        }
      );
    }

    private normalizeStateParams(original: any): C {
      var normalized = _.clone(original);
      normalized.offset = _.parseInt(original.offset) ? _.parseInt(original.offset) : 0;
      normalized.limit = _.parseInt(original.limit); //NOTE(kitaly): Expects valid number at this point
      return this.normalizeMore(normalized);
    }

    // 新たな検索条件で検索 (1ページ目にリセット)
    search(): void {
      var newConditions = this.getNewConditions();
      newConditions.offset = 0;
      newConditions.limit = this.params.limit;
      this.transitionToSelfState(newConditions);
    }

    nextPage(): void {
      var nextPage = this.incrementPage(true);
      this.transitionToSelfState(nextPage);
    }

    prevPage(): void {
      var prev = this.incrementPage(false);
      this.transitionToSelfState(prev);
    }

    moveToPage(page: number): void {
      var newPage = this.paramsToMovePage(page);
      this.transitionToSelfState(newPage);
    }

    getTotalHits()      : number { return this.totalHits; }
    getTotalPages()     : number { return Math.ceil(this.totalHits / this.params.limit); }

    getCurrentPageNum() : number { return Math.ceil(this.params.offset / this.params.limit) + 1; }
    getPageSize()       : number { return this.params.limit; }

    existsNextPage()    : boolean { return (this.getCurrentPageNum() < this.getTotalPages()); }
    existsPrevPage()    : boolean { return (this.getCurrentPageNum() > 1 ); }


    private incrementPage(isNext: boolean): C {
      var newOffset = this.params.offset;

      if(isNext) {
        newOffset = newOffset + this.params.limit;
      } else {
        newOffset = newOffset - this.params.limit;
      }

      if(newOffset < 0) {
        newOffset = 0;
      }

     return this.buildConditionParamsForPage(newOffset);
    }

    private paramsToMovePage(page: number): C {
      var pageSize = this.getPageSize();
      var newOffset = pageSize * (page - 1);
      return this.buildConditionParamsForPage(newOffset);
    }

    private buildConditionParamsForPage(newOffset: number): C {
      var newParams = _.clone(this.params, true);
      newParams.offset = newOffset;
      return newParams;
    }


    protected getZeroOfToday(): string {
      var now = new Date();
      var zeroOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 0, 0, 0, 0);
      return zeroOfToday.toISOString();
    }
  }
}
