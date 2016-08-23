$(function() {

	//*******************header_button*******************		
	$('#search_button').button({
		icons: {
			primary: 'ui-icon-search',
		},
	});

	$('#home_page').button({
		icons: {
			primary: 'ui-icon-home',
		},
	});

	$('#topic_page').button({
		icons: {
			primary: 'ui-icon-image',
		},
	});

	$('#question_button').button({
		icons: {
			primary: 'ui-icon-lightbulb',
		},
	}).click(function() {
		if($.cookie('user')) {
			$('#question').dialog('open');
		} else {
			$('#error').dialog('open');
			setTimeout(function() {
				$('#error').dialog('close');
				$('#login').dialog('open');
			}, 2000);
		}
	});

	//*******************首页******************
	//*******************显示提问的内容******************		
	$.ajax({
		url: 'show_content.php',
		type: 'POST',
		success: function(response, status, xhr) {
			var json = $.parseJSON(response);
			var html = '';
			var arr = [];
			var summary = [];
			$.each(json, function(index, value) {
				//console.log(value.content)
				html += '<a href="#" class="user_pic"><img src="img/mf.png" alt=""></a><h4>' + value.user + '&nbsp;&nbsp;发表于&nbsp;&nbsp;' + value.date + '</h4><h3>' + value.title + '</h3><div class="editor">' + value.content + '</div><div class="bottom"><span class="comment" data-id="' + value.id + '">' + value.count + '条评论</span> <span class="up">收起</span></div><hr noshade="noshade" size="1" /><div class="comment_list"></div>';
			});
			$('.content').append(html);

			$.each($('.editor'), function(index, value) {
				arr[index] = $(value).html();
				summary[index] = arr[index].substr(0, 200);

				if(summary[index].substring(199, 200) == '<') {
					summary[index] = replacePos(summary[index], 200, '');
				}
				if(summary[index].substring(198, 200) == '</') {
					summary[index] = replacePos(summary[index], 200, '');
					summary[index] = replacePos(summary[index], 199, '');
				}

				if(arr[index].length > 200) {
					summary[index] += '......<span class="down">显示全部</span>';
					$(value).html(summary[index]);
				}
				$('.bottom .up').hide();
			});

			$.each($('.editor'), function(index, value) {
				$(this).on('click', '.down', function() {
					$('.editor').eq(index).html(arr[index]);
					$(this).hide();
					$('.bottom .up').eq(index).show();
				});
			});

			$.each($('.bottom'), function(index, value) {
				$(this).on('click', '.up', function() {
					$('.editor').eq(index).html(summary[index]);
					$(this).hide();
					$('.editor .down').eq(index).show();
				});
			});
			//*******************显示评论******************
			$.each($('.bottom'), function(index, value) {
				$(this).on('click', '.comment', function() {
					var comment_this = this;
					if($.cookie('user')) {
						if(!$('.comment_list').eq(index).has('form').length) {
							$.ajax({
								url: 'show_comment.php',
								type: 'POST',
								data: {
									titleid: $(comment_this).attr('data-id'),
								},
								beforeSend: function(jqXHR, settings) {
									$('.comment_list').eq(index).append('<dl class="comment_load"><dd>评论加载中</dd></dl>');
								},
								success: function(response, status) {
									$('.comment_list').eq(index).find('.comment_load').hide();
									var json_comment = $.parseJSON(response);
									var count = 0;
									$.each(json_comment, function(index2, value) {
										count = value.count;
										$('.comment_list').eq(index).append('<dl class="comment_content"><dt><a href="#" class="user_pic"><img src="img/mf.png" alt=""></a>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
									});
									$('.comment_list').eq(index).append('<dl><dd><span class="load_more">更多评论</span></dd></dl>');
									var page = 2;
									if(page > count) {
										$('.comment_list').eq(index).find('.load_more').off('click');
										$('.comment_list').eq(index).find('.load_more').hide();
									}
									$('.comment_list').eq(index).find('.load_more').button().on('click', function() {
										$('.comment_list').eq(index).find('.load_more').button('disable');
										$.ajax({
											url: 'show_comment.php',
											type: 'POST',
											data: {
												titleid: $(comment_this).attr('data-id'),
												page: page,
											},
											beforeSend: function(jqXHR, settings) {
												$('.comment_list').eq(index).find('.load_more').html('<img src="img/more_load.gif" />');
											},
											success: function(response, status) {
												var json_comment_more = $.parseJSON(response);
												$.each(json_comment_more, function(index3, value) {
													$('.comment_list').eq(index).find('.comment_content').last().after('<dl class="comment_content"><dt><a href="#" class="user_pic"><img src="img/mf.png" alt=""></a>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
												});
												$('.comment_list').eq(index).find('.load_more').button('enable');
												$('.comment_list').eq(index).find('.load_more').html('更多评论');
												page++;
												if(page > count) {
													$('.comment_list').eq(index).find('.load_more').off('click');
													$('.comment_list').eq(index).find('.load_more').hide();
												}
											}
										});
									});
									$('.comment_list').eq(index).append('<form><dl class="comment_add"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="' + $(comment_this).attr('data-id') + '" /><input type="hidden" name="user" value="' + $.cookie('user') + '" /><input type="button" value="发表" /></dd></dl></form>');
									$('.comment_list').eq(index).find('input[type=button]').button().click(function() {
										var _this = this;
										$('.comment_list').eq(index).find('form').ajaxSubmit({
											url: 'add_comment.php',
											type: 'POST',
											beforeSubmit: function(formData, jqForm, options) {
												$('#loading').dialog('open');
												$(_this).button('disable');
											},
											success: function(responseText, statusText) {
												if(responseText) {
													$(_this).button('enable');
													$('#loading').css('background', 'url(img/success.gif) no-repeat 20px center').html('发表成功');
													setTimeout(function() {
														var date = new Date();
														$('#loading').dialog('close');
														$('.comment_list').eq(index).prepend('<dl class="comment_content"><dt>' + $.cookie('user') + '</dt><dd>' + $('.comment_list').eq(index).find('textarea').val() + '</dd><dd>' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '</dd></dl>');
														$('.comment_list').eq(index).find('form').resetForm();
														$('#loading').css('background', 'url(img/loading.gif) no-repeat 20px center').html('数据交互中...');
													}, 1000);
												}
											},
										});
									});
								},
							});
						}
						if($('.comment_list').eq(index).is(':hidden')) {
							$('.comment_list').eq(index).show();

						} else {
							$('.comment_list').eq(index).hide();
						}
					} else {
						$('#error').dialog('open');
						setTimeout(function() {
							$('#error').dialog('close');
							$('#login').dialog('open');
						}, 1000);
					}
				});
			});
		}
	});
	//*******************请登陆后操作*******************		
	$('#error').dialog({
		autoOpen: false,
		modal: true,
		closeOnEscape: false, //禁用 Esc 键
		resizable: false,
		draggable: false,
		width: 200,
		height: 50,
	}).parent().find('.ui-widget-header').hide();

	$('#member, #logout').hide();
	if($.cookie('user')) {
		$('#member, #logout').show();
		$('#reg_a, #login_a').hide();
		$('#member').html($.cookie('user'));
	} else {
		$('#member, #logout').hide();
		$('#reg_a, #login_a').show();
	}

	//*******************用户注销*******************			
	$('#logout').click(function() {
		$.removeCookie('user');
		window.location.href = 'index.html';
	});

	//*******************数据加载中*******************			
	$('#loading').dialog({
		autoOpen: false,
		modal: true,
		closeOnEscape: false, //禁用 Esc 键
		resizable: false,
		draggable: false,
		width: 200,
		height: 50,
	}).parent().find('.ui-widget-header').hide();

	//*******************注册*******************	
	$('#reg_a').click(function() {
		$('#reg').dialog('open');
	});

	$('#reg').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 320,
		height: 340,
		buttons: {
			'提交': function() {
				$(this).submit();
			}
		}
	}).validate({

		submitHandler: function(form) {
			$(form).ajaxSubmit({
				url: 'add.php',
				type: 'POST',
				beforeSubmit: function(formData, jqForm, options) {
					$('#loading').dialog('open');
					$('#reg').dialog('widget').find('button').eq(1).button('disable');
				},
				success: function(responseText, statusText) {
					if(responseText) {
						$('#reg').dialog('widget').find('button').eq(1).button('enable');
						$('#loading').css('background', 'url(img/success.gif) no-repeat 20px center').html('注册成功！');
						$.cookie('user', $('#user').val());

						setTimeout(function() {
							$('#loading').dialog('close');
							$('#reg').dialog('close');
							$('#reg').resetForm();
							$('#reg span.star').html('*').removeClass('succ');
							$('#loading').css('background', 'url(img/loading.gif) no-repeat 20px center').html('数据交互中...');
							$('#member, #logout').show();
							$('#reg_a, #login_a').hide();
							$('#member').html($.cookie('user'));

						}, 1000);
					}
				},
			});
		},

		//根据错误提示信息的多少来相应的改变dialog的高度		
		showErrors: function(errorMap, errorList) {
			var errors = this.numberOfInvalids();

			if(errors > 0) {
				$('#reg').dialog('option', 'height', errors * 20 + 340);
			} else {
				$('#reg').dialog('option', 'height', 340);
			}
			this.defaultShowErrors();
		},

		highlight: function(element, errorClass) {
			$(element).css('border', '1px solid #630');
			$(element).parent().find('span').html('*').removeClass('succ');
		},
		unhighlight: function(element, errorClass) {
			$(element).css('border', '1px solid #ccc');
			$(element).parent().find('span').html('&nbsp;').addClass('succ');
		},

		//把错误提示信息放在OL位置
		errorLabelContainer: 'ol.reg_error',
		wrapper: 'li',

		rules: {
			user: {
				required: true,
				minlength: 2,
				remote: {
					url: 'is_user.php',
					type: 'POST',
				},
			},
			pass: {
				required: true,
				minlength: 6,
			},
			email: {
				required: true,
				email: true,
			},
			birthday: {
				required: true,

			},
		},
		messages: {
			user: {
				required: '账号不得为空！',
				minlength: jQuery.format('账号不得小于{0}位！'),
				remote: '账号已经存在，请重新输入！',
			},
			pass: {
				required: '密码不得为空！',
				minlength: jQuery.format('密码不得小于{0}位！'),
			},
			email: {
				required: '邮箱不得为空！',
				minlength: '请输入正确的邮箱格式！',
			},
			birthday: {
				required: '生日不得为空！',
			}
		},
	});

	//*******************日历选择器*******************		
	$('#date').datepicker({
		changeMonth: true, //月份下拉列表
		changeYear: true,
		yearRange: '1950:2020',
		maxDate: 0, //日期限制在当前，不能往后
		showAnim: 'blind',
		yearSuffix: '',

	});

	//*******************邮箱自动补全*******************		
	$('#email').autocomplete({
		delay: 0,
		autoFocus: true,
		source: function(request, response) {
			//获取用户输入的内容
			//alert(request.term);
			//绑定数据源的
			//response(['aa', 'aaaa', 'aaaaaa', 'bb']);

			var hosts = ['qq.com', '163.com', '263.com', 'sina.com.cn', 'gmail.com', 'hotmail.com'],
				term = request.term, //获取用户输入的内容
				name = term, //邮箱的用户名
				host = '', //邮箱的域名
				ix = term.indexOf('@'), //@的位置
				result = []; //最终呈现的邮箱列表

			result.push(term);

			//当有@的时候，重新分别用户名和域名
			if(ix > -1) {
				name = term.slice(0, ix);
				host = term.slice(ix + 1);
			}

			if(name) {
				//如果用户已经输入@和后面的域名，
				//那么就找到相关的域名提示，比如bnbbs@1，就提示bnbbs@163.com
				//如果用户还没有输入@或后面的域名，
				//那么就把所有的域名都提示出来
				//$.grep() 方法是按照某种条件来过滤数组
				var findedHosts = (host ? $.grep(hosts, function(value, index) {
						return value.indexOf(host) > -1
					}) : hosts),
					findedResult = $.map(findedHosts, function(value, index) {
						return name + '@' + value;
					});

				result = result.concat(findedResult);
			}

			response(result);
		},
	});

	//*******************会员登陆*******************		
	$('#login_a').click(function() {
		$('#login').dialog('open');
	});

	$('#login').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 320,
		height: 250,
		buttons: {
			'登陆': function() {
				$(this).submit();
			}
		}
	}).validate({

		submitHandler: function(form) {
			$(form).ajaxSubmit({
				url: 'login.php',
				type: 'POST',
				beforeSubmit: function(formData, jqForm, options) {
					$('#loading').dialog('open');
					$('#login').dialog('widget').find('button').eq(1).button('disable');
				},
				success: function(responseText, statusText) {
					if(responseText) {
						$('#login').dialog('widget').find('button').eq(1).button('enable');
						$('#loading').css('background', 'url(img/success.gif) no-repeat 20px center').html('登陆成功!');
						if($('#expires').is(':checked')) {
							$.cookie('user', $('#login_user').val(), {
								expires: 7,
							});
						} else {
							$.cookie('user', $('#login_user').val());
						}
						setTimeout(function() {
							$('#loading').dialog('close');
							$('#login').dialog('close');
							$('#login').resetForm();
							$('#login span.star').html('*').removeClass('succ');
							$('#loading').css('background', 'url(img/loading.gif) no-repeat 20px center').html('数据交互中...');
							$('#member, #logout').show();
							$('#reg_a, #login_a').hide();
							$('#member').html($.cookie('user'));

						}, 1000);
					}
				},
			});
		},

		//根据错误提示信息的多少来相应的改变dialog的高度		
		showErrors: function(errorMap, errorList) {
			var errors = this.numberOfInvalids();

			if(errors > 0) {
				$('#login').dialog('option', 'height', errors * 20 + 250);
			} else {
				$('#login').dialog('option', 'height', 250);
			}
			this.defaultShowErrors();
		},

		highlight: function(element, errorClass) {
			$(element).css('border', '1px solid #630');
			$(element).parent().find('span').html('*').removeClass('succ');
		},
		unhighlight: function(element, errorClass) {
			$(element).css('border', '1px solid #ccc');
			$(element).parent().find('span').html('&nbsp;').addClass('succ');
		},

		//把错误提示信息放在OL位置
		errorLabelContainer: 'ol.login_error',
		wrapper: 'li',

		rules: {
			login_user: {
				required: true,
				minlength: 2,

			},
			login_pass: {
				required: true,
				minlength: 6,
				remote: {
					url: 'login.php',
					type: 'POST',
					data: {
						login_user: function() {
							return $('#login_user').val();
						},
					},
				},
			},

		},
		messages: {
			login_user: {
				required: '账号不得为空！',
				minlength: jQuery.format('账号不得小于{0}位！'),
				remote: '账号已经存在，请重新输入！',
			},
			login_pass: {
				required: '密码不得为空！',
				minlength: jQuery.format('密码不得小于{0}位！'),
				remote: '账号或密码不正确！',
			},

		},
	});

	//*******************选项卡*******************	
	$('#tabs').tabs({
		collapsible: true, //当设置为 true 是，允许选项卡折叠对应的内容。
		//默认值为 false，不会关闭对应内容。
		heightStyle: 'content', //默认为 content，即根据内容伸展高度。
	});

	//*******************折叠菜单*******************
	$('#accordion').accordion({
		collapsible: true,
		heightStyle: 'content',
		
	});

	//*******************提问对话框*******************
	$('#question').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 900,
		height: 500,
		buttons: {
			'发布': function() {	
				$(this).ajaxSubmit({
					url: 'add_content.php',
					type: 'POST',
					data: {
						user: $.cookie('user'),
						content: $('.edui-body-container').contents().html(),
					},
					beforeSubmit: function(formData, jqForm, options) {
						$('#loading').dialog('open');
						$('#question').dialog('widget').find('button').eq(1).button('disable');
						
					},
					success: function(responseText, statusText) {
						if(responseText) {
							$('#question').dialog('widget').find('button').eq(1).button('enable');
							$('#loading').css('background', 'url(img/success.gif) no-repeat	20px center').html('发布成功！');
							setTimeout(function() {
								$('#loading').dialog('close');
								$('#question').dialog('close');
								$('#question').resetForm();
								$('.edui-body-container').contents().html('请在这里输入内容......');
								$('#loading').css('background', 'url(img/loading.gif) no-repeat 20px center').html('数据交互中...');
							}, 1000);
						}
					},
				});
			}
		}
	});

	//实例化"提问"的编辑器
	var um = UM.getEditor('myEditor');
	//替换特殊字符的函数
	function replacePos(strObj, pos, replaceText) {
		return strObj.substr(0, pos - 1) + replaceText + strObj.substring(pos, strObj.length);
	}
	//首页右上角图片关闭按钮
	$('.glyphicon-remove').click(function() {
		$('.pic').hide('highlight');
	}).tooltip();

	//*******************个人中心******************
	//个人简介
	$('.introduce_a').click(function() {
		$('#introduce').dialog('open');
	});
	$('#introduce').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		height: 200,
		position: 'center center',
		buttons: {
			'确认': function() {
				$(this).validate({

					showErrors: function(errorMap, errorList) {
						var errors = this.numberOfInvalids();

						if(errors > 0) {
							$('#introduce').dialog('option', 'height', errors * 20 + 200);
						} else {
							$('#introduce').dialog('option', 'height', 200);
						}
						this.defaultShowErrors();
					},

					//把错误提示信息放在OL位置
					errorLabelContainer: 'ol.introduce_error',
					wrapper: 'li',

					rules: {
						introduce: {
							required: true,
						},
					},
					messages: {
						introduce: {
							required: '此处不得为空！',
						},
					},
				});
				$(this).submit();

			}
		}
	});

	//教育信息
	$('.education_a').click(function() {
		$('#education').dialog('open');
	});
	$('#education').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 280,
		height: 250,
		position: 'center center',
		buttons: {
			'确认': function() {
				$(this).submit();
			}
		}
	});

	//教育信息
	$('.work_a').click(function() {
		$('#work').dialog('open');
	});
	$('#work').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 280,
		height: 250,
		position: 'center center',
		buttons: {
			'确认': function() {
				$(this).submit();
			}
		}
	});
	//居住地和行业
	$('.location_a').click(function() {
		$('#location').dialog('open');
	});
	$('#location').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 280,
		height: 280,
		position: 'center center',
		buttons: {
			'确认': function() {
				$(this).submit();
			}
		}
	});




	//回到顶部		
	$("#top").click(function() {
		$("html, body").animate({
			scrollTop: 0
		}, "slow");
	});

});