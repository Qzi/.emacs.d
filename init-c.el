;; author: qzi
;; email: i@qzier.com
;; content: c style


;;;;  Helper tools.
(custom-set-variables
 '(semantic-default-submodes 
   (quote (
	   ;; 打开这个mode后，semantic会在类/函数等tag上方加一条蓝色的线，
	   ;; 源文件很大的时候用它可以提示出哪些是类和函数的头。
	   global-semantic-decoration-mode 
	   ;; activates highlighting of local names that are the same as name of tag under cursor;
	   global-semantic-idle-local-symbol-highlight-mode
	   global-semantic-idle-completions-mode
	   global-semantic-idle-scheduler-mode 
	   global-semanticdb-minor-mode
	   global-semanticdb-minor-mode
	   ;;semantic会用灰的底色把光标所在函数名高亮显示
	   global-semantic-highlight-func-mode
	   global-semantic-highlight-edits-mode
	   ;;这个mode会根据光标位置把当前函数名显示在buffer顶上
	   global-semantic-stickyfunc-mode-hook 
	   global-semantic-idle-summary-mode
	   global-semantic-mru-bookmark-mode)))
 '(semantic-idle-scheduler-idle-time 3))

(semantic-mode)

;; smart complitions
(require 'semantic/ia)
(setq-mode-local c-mode semanticdb-find-default-throttle
                 '(project unloaded system recursive))
(setq-mode-local c++-mode semanticdb-find-default-throttle
                 '(project unloaded system recursive))

(global-set-key (kbd "M-n") 'semantic-ia-complete-symbol-menu)

;;;; Include settings
(require 'semantic/bovine/gcc)
(require 'semantic/bovine/c)

(defconst cedet-user-include-dirs
  (list ".." "../include" "../inc" "../common" "../public" "."
        "../.." "../../include" "../../inc" "../../common" "../../public"))

(setq cedet-sys-include-dirs (list
			      "./"
			      "/usr/llvm-gcc-4.2/bin/../lib/gcc/i686-apple-darwin11/4.2.1/include"
			      "/usr/include/c++/4.2.1"
			      "/usr/include/c++/4.2.1/backward"
			      "/usr/local/include"
			      "/Applications/Xcode.app/Contents/Developer/usr/llvm-gcc-4.2/lib/gcc/i686-apple-darwin11/4.2.1/include"
			      "/usr/include"
                              "/usr/local/include"))

(let ((include-dirs cedet-user-include-dirs))
  (setq include-dirs (append include-dirs cedet-sys-include-dirs))
  (mapc (lambda (dir)
          (semantic-add-system-include dir 'c++-mode)
          (semantic-add-system-include dir 'c-mode))
        include-dirs))

(setq semantic-c-dependency-system-include-path "/usr/include/")


;;;; TAGS Menu
(defun my-semantic-hook ()
  (imenu-add-to-menubar "TAGS"))
(add-hook 'semantic-init-hooks 'my-semantic-hook)

;; Semantic DataBase存储位置
(setq semanticdb-default-save-directory
      (expand-file-name "~/.emacs.d/semanticdb"))

;; 使用 gnu global 的TAGS。
(require 'semantic/db-global)
(when (cedet-gnu-global-version-check t)
  (semanticdb-enable-gnu-global-databases 'c-mode)
  (semanticdb-enable-gnu-global-databases 'c++-mode)
  (semanticdb-enable-gnu-global-databases 'js2-mode))

(defun my-cedet-hook ()
  (local-set-key [(control return)] 'semantic-ia-complete-symbol)
  (local-set-key "\C-c?" 'semantic-ia-complete-symbol-menu)
  (local-set-key "\C-c>" 'semantic-complete-analyze-inline)
  (local-set-key "\C-cp" 'semantic-analyze-proto-impl-toggle))
;;绑定cedet-hook
(add-hook 'c-mode-common-hook 'my-cedet-hook)

(defun my-c-mode-cedet-hook ()
 (local-set-key "." 'semantic-complete-self-insert)
 (local-set-key ">" 'semantic-complete-self-insert))
(add-hook 'c-mode-common-hook 'my-c-mode-cedet-hook)

;; 需要开启 [global-]semantic-mru-bookmark 开启
;; 跳转时添加当前的位置进入semantic-mru-bookmark-ring 
;; 通过`C-x B` (semantic-mru-switch-tags) 跳转回去
(defadvice push-mark (around global-semantic-mru-bookmark activate)
  (semantic-mrub-push semantic-mru-bookmark-ring
		      (point)
		      'mark)
  ad-do-it)


;;(require 'cedet)
;;(global-ede-mode t)
;; 
;; 
;;(setq semantic-default-submodes '(global-semantic-idle-scheduler-mode
;;global-semanticdb-minor-mode
;;global-semantic-idle-summary-mode
;;global-semantic-mru-bookmark-mode))
;;(semantic-mode t)
;;(global-semantic-highlight-edits-mode (if window-system 1 -1))
;;(global-semantic-show-unmatched-syntax-mode 1)
;;(global-semantic-show-parser-state-mode 1)
;; 
;; 
;; Semantic/ia
;; smart complitions
;;(require 'semantic/ia)
;;(setq-mode-local c-mode semanticdb-find-default-throttle
;;'(project unloaded system recursive))
;;(setq-mode-local c++-mode semanticdb-find-default-throttle
;;'(project unloaded system recursive))
;; 
;;;; header
;;;;;; Include settings
;;(require 'semantic/bovine/gcc)
;;(require 'semantic/bovine/c)
;; 
;;(defconst cedet-user-include-dirs
;;(list ".." "../include" "../inc" "../common" "../public" "."
;;"../.." "../../include" "../../inc" "../../common" "../../public"))
;; 
;;(setq cedet-sys-include-dirs (list
;;"/usr/llvm-gcc-4.2/bin/../lib/gcc/i686-apple-darwin11/4.2.1/include"
;;"/usr/include/c++/4.2.1"
;;"/usr/include/c++/4.2.1/backward"
;;"/Applications/Xcode.app/Contents/Developer/usr/llvm-gcc-4.2/lib/gcc/i686-apple-darwin11/4.2.1/include"
;;"./"
;;"/usr/include"
;;"/usr/local/include"))
;; 
;;(let ((include-dirs cedet-user-include-dirs))
;;(setq include-dirs (append include-dirs cedet-sys-include-dirs))
;;(mapc (lambda (dir)
;;(semantic-add-system-include dir 'c++-mode)
;;(semantic-add-system-include dir 'c-mode))
;;include-dirs))
;; 
;;(setq semantic-c-dependency-system-include-path "/usr/include/")
;; 
;;;; semantic 通过imenu集成到emacs
;;;; TAGS Menu
;;(defun my-semantic-hook ()
;;  (imenu-add-to-menubar "TAGS"))
;; 
;;(add-hook 'semantic-init-hooks 'my-semantic-hook)
;; 
;;;;;; Semantic DataBase存储位置
;;(setq semanticdb-default-save-directory
;;      (expand-file-name "~/.emacs.d/semanticdb"))
;; 
;;;; 使用 gnu global 的TAGS。
;;(require 'semantic/db-global)
;;(semanticdb-enable-gnu-global-databases 'c-mode)
;;(semanticdb-enable-gnu-global-databases 'c++-mode)

;; semantic auto-complete-mode
 
;;;;;;  缩进或者补齐 绑定到hippie-try-expand
;;;; hippie-try-expand settings
;;(setq hippie-expand-try-functions-list
;;      '(
;;	yas/hippie-try-expand
;;	semantic-ia-complete-symbol
;;	try-expand-dabbrev  ;; 搜索当前buffer
;;	try-expand-dabbrev-visible  ;; 搜索当前可见窗口
;;	try-expand-dabbrev-all-buffers	;; 搜索所有buffer
;;	try-expand-dabbrev-from-kill  ;; 从kill-ring中搜索
;;	try-complete-file-name-partially  ;; 文件名部分匹配
;;	try-complete-file-name	;; 文件名匹配
;;	try-expand-all-abbrevs	;; 匹配所有缩写词
;;	try-expand-list	 ;; 补全一个列表
;;	try-expand-line	 ;; 补全当前行
;;	try-complete-lisp-symbol-partially  ;; 部分补全elisp symbol
;;	try-complete-lisp-symbol  ;; 补全lisp symbol
;;	)
;;      )
;; 
;;(defun indent-or-complete ()
;;  "Complete if point is at end of a word, otherwise indent line."
;;  (interactive)
;;  (if (looking-at "\\>")
;;      (hippie-expand nil)
;;    (indent-for-tab-command)
;;    ))
;; 
;;(defun yyc/indent-key-setup ()
;;  "Set tab as key for indent-or-complete"
;;  (local-set-key  [(tab)] 'indent-or-complete)
;;  )
 
;;;; C-mode-hooks .
;; 对于C和C++的struct/class结构，函数semantic-complete-self-insert 可以插入类或结构中的成员变量，将至绑定到"."或者">"，会加速代码编写的效率：
;;(defun yyc/c-mode-keys ()
;;  "description"
;;  ;; Semantic functions.
;;  (semantic-default-c-setup)
;;  (local-set-key "\C-c?" 'semantic-ia-complete-symbol-menu)
;;  (local-set-key "\C-cb" 'semantic-mrub-switch-tags)
;;  (local-set-key "\C-cR" 'semantic-symref)
;;  (local-set-key "\C-cj" 'semantic-ia-fast-jump)
;;  (local-set-key "\C-cp" 'semantic-ia-show-summary)
;;  (local-set-key "\C-cl" 'semantic-ia-show-doc)
;;  (local-set-key "\C-cr" 'semantic-symref-symbol)
;;  (local-set-key "\C-c/" 'semantic-ia-complete-symbol)
;;  (local-set-key [(control return)] 'semantic-ia-complete-symbol)
;;  (local-set-key "." 'semantic-complete-self-insert)
;;  (local-set-key ">" 'semantic-complete-self-insert)
;;  ;; Indent or complete
;;  (local-set-key  [(tab)] 'indent-or-complete)
;;  )
;;(add-hook 'c-mode-common-hook 'yyc/c-mode-keys)

;;;; 解决可以用 semantic-ia-fast-jump 跳转到Tag定义， 但是每次跳转后，却不能跳回来
;;(defadvice push-mark (around semantic-mru-bookmark activate)
;;  "Push a mark at LOCATION with NOMSG and ACTIVATE passed to `push-mark'.
;; If `semantic-mru-bookmark-mode' is active, also push a tag onto the mru bookmark stack."
;;  (semantic-mrub-push semantic-mru-bookmark-ring
;;		      (point)
;;		      'mark)
;;  ad-do-it)
;;

;; 定义在cpp文件和.h文件中切换的函数
(defun switch-source-file ()
  (interactive)
  (setq file-name (buffer-file-name))
  (if (string-match "\\.cc" file-name)
      (find-file (replace-regexp-in-string "\\.cc" "\.h" file-name)))
  (if (string-match "\\.h" file-name)
      (find-file (replace-regexp-in-string "\\.h" "\.cc" file-name)))
  )

(global-set-key [f11] 'switch-source-file)


;; 输入 inc , 可以自动提示输入文件名称,可以自动补全.
(define-skeleton skeleton-include
  "generate include""" ""
  > "#include \""
  (completing-read "Include File:"
		   (mapcar #'(lambda (f) (list f ))
			   (apply 'append
				  (mapcar
				   #'(lambda (dir)
				       (directory-files dir))
				   (list
				    "./"
				    "/usr/llvm-gcc-4.2/bin/../lib/gcc/i686-apple-darwin11/4.2.1/include"
				    "/usr/include/c++/4.2.1"
				    "/usr/include/c++/4.2.1/backward"
				    "/usr/local/include"
				    "/Applications/Xcode.app/Contents/Developer/usr/llvm-gcc-4.2/lib/gcc/i686-apple-darwin11/4.2.1/include"
				    "/usr/include"
				    "/usr/local/include")
				   ))))
  "\"")


;;;; clang && llvm
;;;; ---------------
;;(require 'auto-complete-clang)
;;;;(setq ac-clang-auto-save t)
;; 
;; 
;;;; 语义分析目录, 供后面添加使用
;;(defconst user-include-dirs
;;  (list
;;   "./"
;;   "/usr/llvm-gcc-4.2/bin/../lib/gcc/i686-apple-darwin11/4.2.1/include"
;;   "/usr/include/c++/4.2.1"
;;   "/usr/include/c++/4.2.1/backward"
;;   "/usr/local/include"
;;   "/Applications/Xcode.app/Contents/Developer/usr/llvm-gcc-4.2/lib/gcc/i686-apple-darwin11/4.2.1/include"
;;   "/usr/include"
;;   "/usr/local/include"
;;   ;;	"/System/Library/Frameworks (framework directory)"
;;   ;;	"/Library/Frameworks (framework directory)"
;;   ))
;; 
;; 
;; 
;;(defun my-ac-clang-config ()
;;  (setq ac-clang-flags
;;	(mapcar(lambda (item)(concat "-I" item))
;;	       user-include-dirs))
;;  )
;; 
;;(defun my-ac-clang-mode-setup ()
;;  (make-local-variable 'ac-auto-start)
;;  (setq ac-auto-start nil)		;auto complete using clang is CPU sensitive  
;;  (setq ac-sources (append '(ac-source-clang ac-source-yasnippet) ac-sources))
;;  ;;(setq-default ac-sources '(ac-source-clang ac-source-yasnippet))
;;)
;; 
;;(add-hook 'c-mode-common-hook 'my-ac-clang-mode-setup)
;;;;(add-hook 'c++-mode-hook 'my-ac-clang-mode-setup)
;;(add-hook 'js2-mode-hook 'my-ac-clang-mode-setup)
;;(my-ac-clang-config)
 
;; ac-clang-face
;;(set-face-background 'ac-clang-selection-face "red")
;;(set-face-background 'ac-clang-candidate-face "#eeeeee")
;;(set-face-underline 'ac-clang-candidate-face "#999999")
;;
;; c style setting
(defun my-c-code-hook()

  ;; 将回车代替C-j的功能，换行的同时对齐 
  ;;(define-key c-mode-map [return] 'newline-and-indent) 
  (interactive) 
  ;; 设置C程序的对齐风格 
  ;; (c-set-style "K&R") 
  ;; 自动模式，在此种模式下当你键入{时，会自动根据你设置的对齐风格对齐 
  ;; (c-toggle-auto-state) 
  ;; 此模式下，当按Backspace时会删除最多的空格 
  (c-toggle-hungry-state) 
  ;; 在菜单中加入当前Buffer的函数索引 
  (imenu-add-menubar-index) 
  ;; TAB键的宽度设置为8 
  (setq c-basic-offset 4) 
  ;; 在状态条上显示当前光标在哪个函数体内部 
  (which-function-mode) 
  ;; 代码折叠
  (hs-minor-mode t)
)

(defun my-c++-mode-hook() 
;;  (define-key c++-mode-map [return] 'newline-and-indent) 
  (interactive) 
  (c-set-style "stroustrup") 
  (c-toggle-auto-state) 
  (c-toggle-hungry-state) 
  (setq c-basic-offset 4) 
  (imenu-add-menubar-index) 
  (which-function-mode) 
  (hs-minor-mode t)
  ) 

(add-hook 'c-mode-hook 'my-c-mode-hook) 
(add-hook 'c++-mode-hook 'my-c++-mode-hook) 


(provide 'init-c)
