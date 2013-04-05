;; author: qzi
;; email: i@qzier.com
;; content: ui setting


;; window-system setting
(if (display-graphic-p)
 (if window-system
     (progn 
       (set-frame-width nil 100)
       (set-frame-parameter nil 'fullscreen 'fullheight)
       
       ;; alpha: (list active fade)
       (set-frame-parameter (selected-frame) 'alpha (list 97 95))
;;     (add-to-list 'default-frame-alist (cons 'alpha (list 20 10)))
       )
   )
 )

;; tool-bar-mode
(tool-bar-mode 0)


;; scroll-bar-mode
(scroll-bar-mode 0)


;; column number
(column-number-mode t)


;; size of file 
(size-indication-mode t)


;; resize mimibuffer windows
(setq resize-mini-windows t)


;; load theme
(if (display-graphic-p)
    (load-theme 'tango)
  (load-theme 'wombat) ;; else {}
  )


;; 让emacs 标题显示当前buffer名字
(setq frame-title-format "%b @emacs")


;; 高亮当前行
(global-hl-line-mode t)


;; fill-column-indicator
(require 'fill-column-indicator)
(setq-default fci-rule-column 80)
(setq fci-handle-truncate-lines nil)
(define-globalized-minor-mode global-fci-mode 
  fci-mode 
  (lambda () (fci-mode 1)))
(global-fci-mode 1)
(defun auto-fci-mode (&optional unused)
  (if (> (window-width) fci-rule-column)
      (fci-mode 1)
    (fci-mode 0))
  )
(add-hook 'after-change-major-mode-hook 'auto-fci-mode)
(add-hook 'window-configuration-change-hook 'auto-fci-mode)


;; desc: powerline
;; mode:  emacs-powerline
;; link: https://github.com/jonathanchu/emacs-powerline
;; -----------------------
(require 'powerline)
;; 
;;(defun graphic-powerline-config ()
;;  "powerline setting for graphic"
;;  (interactive)
;;  (progn
;;   (setq powerline-arrow-shape 'arrow)
;;   (custom-set-faces
;;    '(mode-line ((t (:foreground "white" :background "#0044cc" :box nil))))
;;    '(mode-line-inactive ((t (:foreground "white" :background "#262626" :box nil))))
;;    )
;;   (setq powerline-color1 "#0088cc")
;;   (setq powerline-color2 "white")
;;   )
;;  )
;; 
;;(defun terminal-powerline-config()
;;   " powerline setting for terminal"
;;   (interactive)
;;   (setq powerline-arrow-shape 'arrow)
;;   (setq powerline-color1 "grey22")
;;   (setq powerline-color2 "grey22") 
;;   (custom-set-faces
;;    '(mode-line ((t (:foreground "grey44" :background "grey22" :box nil))))
;;    '(mode-line-inactive ((t (:foreground "grey22" :background "grey44" :box nil))))
;;    ))
;;
;;  "根据是否图形界面加载配置"
;;(if (display-graphic-p)
;;    (graphic-powerline-config)
  ;;  (terminal-powerline-config)
;;)
;;												 
;;												 

;; powerline.el
(defun arrow-right-xpm (color1 color2)
  "Return an XPM right arrow string representing."
  (format "/* XPM */
static char * arrow_right[] = {
\"12 18 2 1\",
\". c %s\",
\"  c %s\",
\".           \",
\"..          \",
\"...         \",
\"....        \",
\".....       \",
\"......      \",
\".......     \",
\"........    \",
\".........   \",
\".........   \",
\"........    \",
\".......     \",
\"......      \",
\".....       \",
\"....        \",
\"...         \",
\"..          \",
\".           \"};"  color1 color2))

(defun arrow-left-xpm (color1 color2)
  "Return an XPM right arrow string representing."
  (format "/* XPM */
static char * arrow_right[] = {
\"12 18 2 1\",
\". c %s\",
\"  c %s\",
\"           .\",
\"          ..\",
\"         ...\",
\"        ....\",
\"       .....\",
\"      ......\",
\"     .......\",
\"    ........\",
\"   .........\",
\"   .........\",
\"    ........\",
\"     .......\",
\"      ......\",
\"       .....\",
\"        ....\",
\"         ...\",
\"          ..\",
\"           .\"};"  color2 color1))

;;(defconst color1 "#CDC0B0")
;;(defconst color2 "#CDC0B0")
;;(defconst color3 "#CDC0B0")
;;(defconst color4 "#FF6699")



(defconst color1 "#FF6699")
;;(defconst color3 "#FF6699")
(if (display-graphic-p) (defconst color3 "#CDC0B0") (defconst color3 "#FF6699"))
(defconst color2 "#FF0066")
(defconst color4 "#CDC0B0")


(defvar arrow-right-1 (create-image (arrow-right-xpm color1 color2) 'xpm t :ascent 'center))
(defvar arrow-right-2 (create-image (arrow-right-xpm color2 "None") 'xpm t :ascent 'center))
(defvar arrow-left-1  (create-image (arrow-left-xpm color2 color1) 'xpm t :ascent 'center))
(defvar arrow-left-2  (create-image (arrow-left-xpm "None" color2) 'xpm t :ascent 'center))

(setq-default mode-line-format
 (list  '(:eval (concat (propertize " %b " 'face 'mode-line-color-1)
                        (propertize " " 'display arrow-right-1)))
        '(:eval (concat (propertize " %m " 'face 'mode-line-color-2)
                        (propertize " " 'display arrow-right-2)))

        ;; Justify right by filling with spaces to right fringe - 16
        ;; (16 should be computed rahter than hardcoded)
        '(:eval (propertize " " 'display '((space :align-to (- right-fringe 17)))))

        '(:eval (concat (propertize " " 'display arrow-left-2)
                        (propertize " %p " 'face 'mode-line-color-2)))
        '(:eval (concat (propertize " " 'display arrow-left-1)
                        (propertize "%4l:%2c  " 'face 'mode-line-color-1)))
)) 

(make-face 'mode-line-color-1)
(set-face-attribute 'mode-line-color-1 nil
                    :foreground "#fff"
                    :background color1)

(make-face 'mode-line-color-2)
(set-face-attribute 'mode-line-color-2 nil
                    :foreground "#fff"
                    :background color2)

(set-face-attribute 'mode-line nil
                    :foreground "#fff"
                    :background color3
                    :box nil)
(set-face-attribute 'mode-line-inactive nil
                    :foreground "#fff"
                    :background color4)


(provide 'init-ui)
