;(function ($, window, document, undefined) {
   $.fn.Pagination = function (option) {
      var pagination = new Paginatioin(this, option);
      pagination.initPage();
   };

   function Paginatioin(ele, opt) {
      this.$element = ele;
      this.defaults = {
         currentPage: 0,//当前页码
         total: 100,//最大页码
         display_num: 8,//中间加载的条数
         num_edge_entries: 1,//边缘页码
         opt_prev_items: true,//是否加载上一页按钮
         opt_next_items: true,//下一页按钮
         opt_layout_findInput: false,//是否加载查询输入框
         span_text: '...',//省略页码文本
		 prev_btn_text: '上一页',
		 next_btn_text: '下一页',
         callback:null//回调函数
      };
      this.opt = opt;
      this.options = $.extend({}, this.defaults, this.opt);
      this.drawFindInput = false;
   }

   Paginatioin.prototype = {
      initPage: function () {
         this.drawPaginationNode();

      },
      /**
       * 获取 中间加载的页码范围，返回一个数组，起始位置和结束位置
       * @returns {[*,*]}
       */
      getStartEndInterval: function () {
         var display_num = Math.ceil(this.options.display_num / 2);
         var start = this.options.currentPage > display_num ? Math.max(Math.min(this.options.currentPage - display_num, this.options.total - this.options.display_num), 0) : 0;
         var end = this.options.currentPage > display_num ? Math.min(this.options.currentPage + display_num, this.options.total) : Math.min(this.options.display_num, this.options.total);
         return [start, end];
      },
      /**
       * 点击页码重新渲染页码，若有回调便执行回调
       * @param page_id
       */
      clickPageNodeDraw: function (page_id) {
         this.options.currentPage = page_id;
         this.drawPaginationNode();
         if (typeof this.options.callback === 'function') {
            this.options.callback(page_id)
         }
      },
      /**
       * 渲染页码节点
       */
      drawPaginationNode: function () {
         this.$element.empty();
         var self = this;
         var getStartEndArray = this.getStartEndInterval();
         //console.log(getStartEndArray);

         var drawItem = function (page_id, appendopts) {
            page_id = page_id < 0 ? 0 : (page_id < self.options.total ? page_id : self.options.total - 1);
            appendopts = $.extend({text: page_id + 1, className: ''}, appendopts || {});
            //console.log(page_id);
            if (page_id == self.options.currentPage) {
               //console.log('self.options.currentPage = ' + self.options.currentPage);
               var node = $('<a href="javascript:void(0)" class="currentPage">' + appendopts.text + '</a>')
            } else {
               var node = $('<a href="javascript:void(0)">' + appendopts.text + '</a>')
                  .on('click', self.clickPageNodeDraw.bind(self,page_id))
                  .on('mouseover', function () {
                     if (!$(this).hasClass('currentPage')) {
                        $(this).css('background-color','#edf8fa')
                     }
                  })
                  .on('mouseout', function () {
                     if (!$(this).hasClass('currentPage')) {
                        $(this).css('background-color','#fff')
                     }
                  })

            }
            if (appendopts.className) {
               node.addClass(appendopts.className);
            }
            if (self.drawFindInput == true && page_id > 0) {
               if (self.options.opt_layout_findInput) {
                  //console.log(page_id);
                  //console.log(self.options.total);
                  jQuery('<span>-</span>').appendTo(self.$element);
                  jQuery('<a href="javascript:void(0)" class="input" contenteditable="true">' +( page_id > 0 ? (page_id == self.options.total - 1 ? page_id + 1 : page_id): 1) + '</a>').appendTo(self.$element);
                  jQuery('<a href="javascript:void(0)" class="btn">跳转</a>')
                     .bind('click', function () {
                        var page_id = self.$element.find('a.input').text();
                        self.clickPageNodeDraw(page_id - 1);
                     }).appendTo(self.$element);
               }
            }
            self.drawFindInput = false;
            self.$element.append(node);
         };

         // 渲染上一页
         this.layoutPrevPage(drawItem);

         // 渲染起始位置
         this.layoutBeginPage(getStartEndArray, drawItem);

         // 渲染中间位置页码
         this.layoutMiddlePage(getStartEndArray, drawItem);

         // 渲染结束位置页码
         this.layoutEndPage(getStartEndArray, drawItem);

         // 渲染下一页
         this.layoutNextPage(drawItem);

      },
      /**
       * 渲染中上一页
       * @param drawItem
       */
      layoutPrevPage: function (drawItem) {

         if (this.options.currentPage > 0 || this.options.opt_prev_items) {
            drawItem(this.options.currentPage - 1, {text: this.options.prev_btn_text, className: 'prev'});
         }
      },
      /**
       * 渲染其实位置页码
       * @param getStartEndArray
       * @param drawItem
       */
      layoutBeginPage: function (getStartEndArray, drawItem) {
         if (getStartEndArray[0] > 0 && this.options.num_edge_entries > 0) {
            var end = Math.min(this.options.num_edge_entries, getStartEndArray[0]);
            for (var i = 0; i < end; i++) {
               drawItem(i);
            }

            if (this.options.num_edge_entries < getStartEndArray[0] && this.options.span_text) {
               $('<span>' + this.options.span_text + '</span>').appendTo(this.$element)
            }
         }
      },
      /**
       * 渲染中间位置页码
       * @param getStartEndArray
       * @param drawItem
       */
      layoutMiddlePage: function (getStartEndArray, drawItem) {
         for (var i = getStartEndArray[0]; i < getStartEndArray[1]; i++) {
            drawItem(i);
         }
         if (this.options.currentPage == this.options.total - 1 || this.options.currentPage == this.options.total - 2) {
            this.drawFindInput = true;
         }
      },
      /**
       * 渲染结束位置页码
       * @param getStartEndArray
       * @param drawItem
       */
      layoutEndPage: function (getStartEndArray, drawItem) {
         if (getStartEndArray[1] < this.options.total && this.options.num_edge_entries > 0) {
            if (this.options.total - this.options.num_edge_entries > getStartEndArray[1] && this.options.span_text) {
               $('<span>' + this.options.span_text + '</span>').appendTo(this.$element);
            }

            var begin = Math.max(this.options.total - this.options.num_edge_entries, getStartEndArray[1]);

            for (var i = begin; i < this.options.total; i++) {
               drawItem(i);
            }
            this.drawFindInput = true;
         }
      },
      // 渲染下一页
      layoutNextPage: function (drawItem) {
         if (this.options.currentPage <= this.options.total - 1 || this.opt_next_items) {
            drawItem(this.options.currentPage + 1, {text: this.options.next_btn_text, className: 'next'})
         }
      }
   }
})(jQuery, window, document, undefined);
