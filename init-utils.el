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

(global-set-key (kbd "C-c l") 'copy-lines)

(provide 'init-utils)
