;; author: qzi
;; email: i@qzier.com
;; content: utils

;;;复制一行或者多行
;;；C-c C-l 复制整行, 而"C-u 5 C-c C-l"复制 5 行
(defun copy-lines(&optional arg)
  (interactive "p") ;; (interactive "prompt-string")
  (save-excursion
    (beginning-of-line)
    (set-mark (point)) ;; point return value of point, as an integer
    (next-line arg)
    (kill-ring-save (mark) (point)) ;; yank (BEG END) into kill ring
    )
  )

;;(global-set-key (kbd "C-c l") 'copy-lines)

;; fullscreen
;; ----------------------
(defun toggle-fullscreen ()
  "Toggle full screen on mac"
  (interactive)
  (when (eq window-system 'mac)
    (set-frame-parameter
     nil 'fullscreen
     (when (not (frame-parameter nil 'fullscreen)) 'fullboth ))))

(global-set-key [f12] 'toggle-fullscreen)
;;(add-to-list 'initial-frame-alist `(fullscreen . fullheight))
;;(add-to-list 'default-frame-alist `(fullscreen . fullheight))
(set-frame-parameter nil 'fullscreen 'fullheight)


;; 自动补全括号
(defun my-common-mode-auto-pair () 
  (interactive) 
  (make-local-variable 'skeleton-pair-alist) 
  (setq skeleton-pair-alist '( 
			      (? ? _ "''")
			      (? ? _ """")
			      (? ? _ "()")
			      (? ? _ "[]")
			      (?{ \n > _ \n ?} >)))
  (setq skeleton-pair t)
  (local-set-key (kbd "(") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "\"") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "{") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "\'") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "[") 'skeleton-pair-insert-maybe))


;; 用"%"在匹配的括号之间来回跳转
(defun match-paren (arg)
  "Go to the matching paren if on a paren; otherwise insert %."
  (interactive "p")
  (cond ((looking-at "\\s\(") (forward-list 1) (backward-char 1))
	((looking-at "\\s\)") (forward-char 1) (backward-list 1))
	(t (self-insert-command (or arg 1)))))


(provide 'init-utils)
