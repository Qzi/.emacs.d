;; author: qzi
;; email: i@qzier.com
;; content: c style


;; 语义分析目录
(defconst user-include-dirs
  (list
   "./"
   "/usr/llvm-gcc-4.2/bin/../lib/gcc/i686-apple-darwin11/4.2.1/include"
   "/usr/include/c++/4.2.1"
   "/usr/include/c++/4.2.1/backward"
   "/usr/local/include"
   "/Applications/Xcode.app/Contents/Developer/usr/llvm-gcc-4.2/lib/gcc/i686-apple-darwin11/4.2.1/include"
   "/usr/include"
;;   "/System/Library/Frameworks (framework directory)"
;;   "/Library/Frameworks (framework directory)"
   ))



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
;;;; Semantic/ia
;;;; smart complitions
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
 
;; semantic 通过imenu集成到emacs
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
;; 
;;;;;;  缩进或者补齐
;;; hippie-try-expand settings
;;(setq hippie-expand-try-functions-list
;;      '(
;; 	yas/hippie-try-expand
;; 	semantic-ia-complete-symbol
;; 	try-expand-dabbrev  ;; 搜索当前buffer
;; 	try-expand-dabbrev-visible  ;; 搜索当前可见窗口
;; 	try-expand-dabbrev-all-buffers  ;; 搜索所有buffer
;; 	try-expand-dabbrev-from-kill  ;; 从kill-ring中搜索
;; 	try-complete-file-name-partially  ;; 文件名部分匹配
;; 	try-complete-file-name  ;; 文件名匹配
;; 	try-expand-all-abbrevs  ;; 匹配所有缩写词
;; 	try-expand-list  ;; 补全一个列表
;; 	try-expand-line  ;; 补全当前行
;; 	try-complete-lisp-symbol-partially  ;; 部分补全elisp symbol
;; 	try-complete-lisp-symbol  ;; 补全lisp symbol
;; 	)
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
;; 
;;;;;; C-mode-hooks .
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
;; 
;;(defadvice push-mark (around semantic-mru-bookmark activate)
;;  "Push a mark at LOCATION with NOMSG and ACTIVATE passed to `push-mark'.
;; If `semantic-mru-bookmark-mode' is active, also push a tag onto the mru bookmark stack."
;;  (semantic-mrub-push semantic-mru-bookmark-ring
;;		      (point)
;;		      'mark)
;;  ad-do-it)


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
				   user-include-dirs))))
  "\"")


;; clang && llvm
(require 'auto-complete-clang)
;;(setq ac-clang-auto-save t)

(defun my-ac-clang-config ()
  (setq ac-clang-flags
	(mapcar(lambda (item)(concat "-I" item))
	       user-include-dirs))
  )

(defun my-ac-clang-mode-setup ()
  (make-local-variable 'ac-auto-start)
  (setq ac-auto-start nil)              ;auto complete using clang is CPU sensitive  
  (setq ac-sources (append '(ac-source-clang ac-source-yasnippet) ac-sources))
  ;;(setq-default ac-sources '(ac-source-clang ac-source-yasnippet))
)

(add-hook 'c-mode-common-hook 'my-ac-clang-mode-setup)
;;(add-hook 'c++-mode-hook 'my-ac-clang-mode-setup)
;;(add-hook 'c-mode-hook 'my-ac-clang-mode-setup)
(my-ac-clang-config)

;; ac-clang-face
(set-face-background 'ac-clang-selection-face "red")
(set-face-background 'ac-clang-candidate-face "#eeeeee")
(set-face-underline 'ac-clang-candidate-face "#999999")


(provide 'init-c)
