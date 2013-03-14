 ;; author: qzi
 ;; email: i@qzier.com
 ;; content: yasnippet  && auto-complete

 ;; yasnippet
 ;; =========
 (add-to-list 'load-path
        "~/.emacs.d/plugins/yasnippet")
 (require 'yasnippet)
 (setq yas-snippet-dirs
       '("~/.emacs.d/plugins/yasnippet/snippets"
         "~/.emacs.d/plugins/yasnippet/extras/imported"
         ))
(yas-global-mode 1)

;; default TAB key is occupied by auto-complete
(global-set-key (kbd "C-c ; u") 'yas/expand)
;; default hotkey `C-c & C-s` is still valid
(global-set-key (kbd "C-c ; s") 'yas/insert-snippet)
;; give yas/dropdown-prompt in yas/prompt-functions a chance
(require 'dropdown-list)
;; use yas/completing-prompt when ONLY when `M-x yas/insert-snippet'
;; thanks to capitaomorte for providing the trick.
(defadvice yas/insert-snippet (around use-completing-prompt activate)
     "Use `yas/completing-prompt' for `yas/prompt-functions' but only here..."
 (let ((yas/prompt-functions '(yas/completing-prompt)))
   ad-do-it))  

 ;;; use popup menu for yas-choose-value
 (require 'popup)
 ;; add some shotcuts in popup menu mode
 (define-key popup-menu-keymap (kbd "M-n") 'popup-next)
 (define-key popup-menu-keymap (kbd "TAB") 'popup-next)
 (define-key popup-menu-keymap (kbd "<tab>") 'popup-next)
 (define-key popup-menu-keymap (kbd "<backtab>") 'popup-previous)
 (define-key popup-menu-keymap (kbd "M-p") 'popup-previous)

 (defun yas-popup-isearch-prompt (prompt choices &optional display-fn)
   (when (featurep 'popup)
     (popup-menu*
      (mapcar
       (lambda (choice)
   (popup-make-item
    (or (and display-fn (funcall display-fn choice))
        choice)
    :value choice))
       choices)
      :prompt prompt
      ;; start isearch mode immediately
      :isearch t
      )))

 (setq yas-prompt-functions '(yas-popup-isearch-prompt yas-ido-prompt yas-no-prompt))


 ;; auto complete
 ;; =============
 (add-to-list 'load-path "~/.emacs.d/elpa/auto-complete-1.4")
 (require 'auto-complete-config)
 (add-to-list 'ac-dictionary-directories "~/.emacs.d/elpa/auto-complete-1.4/dict")
 (ac-config-default)
 (global-auto-complete-mode t)
 (global-set-key (kbd "M-[") 'auto-complete)

 (setq-default ac-sources 
               '(ac-source-yasnippet ;; need yasnippet, 不兼容了现在
                 ac-source-filename
                 ac-source-words-in-all-buffer
                 ac-source-functions
                 ac-source-variables
                 ac-source-symbols
                 ac-source-semantic
                 ac-source-abbrev
                 ac-source-words-in-same-mode-buffers
                 ac-source-dictionary
                 ac-source-css-property
                 ac-source-emacs-lisp-features
                 ac-source-files-in-current-dir))

;; desc: ac-popup-tip-helper 
;; path: ~/.emacs.d/plugins/ac-pos-tip
(require 'pos-tip)
(setq ac-quick-help-prefer-pos-tip t)   ;default is t

;; 设置函数提示
(setq ac-use-quick-help t)
(setq ac-quick-help-delay 1.0)

;; 关闭ac自动启动，并设置促发的按键
(setq ac-auto-start nil)
(ac-set-trigger-key "<C-return>")

;; backspace 也激活
(setq ac-trigger-commands
      (cons 'backward-delete-char-untabify ac-trigger-commands))

;; 激活ac-fuzzy
(setq ac-fuzzy-enable t)


(provide 'init-yas-ac)
