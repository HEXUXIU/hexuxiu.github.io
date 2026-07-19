"""
EJS → Tera 模板转换脚本
把 hexo-theme-argon 的 EJS 模板转成 Zola 的 Tera 模板
"""
import re
import os
import shutil

SRC = r"C:/Users/范千韶/hexo-theme-argon/layout"
DST = r"C:/Users/范千韶/hexuxiu.github.io/templates/argon"

if os.path.exists(DST):
    shutil.rmtree(DST)
shutil.copytree(SRC, DST)

def convert_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 移除 EJS 注释 <%# ... %>
    content = re.sub(r'<%\s*#.*?%>', '', content)

    # 2. include 转换
    content = re.sub(
        r'<%- include\([\'"](\w+(?:/\w+)?)[\'"]\) %>',
        r'{% include "\1.html" %}',
        content
    )
    content = re.sub(
        r'<%- partial\([\'"]_partial/(\w+)[\'"]\s*,\s*\{[^}]*\}\) %>',
        r'{% include "_\1.html" %}',
        content
    )

    # 3. 输出变量: <%= expr %> → {{ expr }}
    content = re.sub(r'<%= (.+?) %>', r'{{ \1 }}', content)

    # 4. 带横杠输出: <%- expr %> → {{ expr }}
    content = re.sub(r'<%- (.+?) %>', r'{{ \1|safe }}', content)

    # 5. 控制流: <% if (...) { %> → {% if ... %}
    content = re.sub(
        r'<%\s*if\s*\((.+?)\)\s*\{\s*%>',
        lambda m: '{% if ' + m.group(1).strip() + ' %}',
        content
    )

    # 6. for 循环: for (let i in list) → for i in list
    content = re.sub(
        r'<%\s*for\s*\(\s*let\s+(\w+)\s+in\s+(.+?)\)\s*\{\s*%>',
        lambda m: '{% for ' + m.group(1) + ' in ' + m.group(2).strip() + ' %}',
        content
    )

    # 7. 对象遍历: for (let i in obj) → for i, val in obj
    # 先处理普通 for 循环

    # 8. 闭合标签: <% } %> → 智能判断
    # 先处理 } else {
    content = re.sub(r'<%\s*\}\s*else\s*\{', '{% else %}', content)
    content = re.sub(r'<%\s*\}\s*else\s*if\s*\((.+?)\)\s*\{', r'{% elif \1 %}', content)
    # 处理剩余的 }
    lines = []
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '{% }' or stripped == '{%}':
            lines.append(line.replace('{% }', '{% endif %}').replace('{%}', '{% endif %}'))
        elif stripped == '{% } %}' or stripped == '{%}%}':
            lines.append(line.replace('{% } %}', '{% endif %}').replace('{%}%}', '{% endif %}'))
        else:
            lines.append(line)
    content = '\n'.join(lines)

    # 9. Hexo 特定函数转换
    replacements = {
        r'url_for\(([^)]+)\)': r'\1',
        r'full_date\(([^,]+),\s*[\'"]YYYY-M-D H:mm[\'"]\)': r'\1 | date(format="%Y-%m-%d %H:%M")',
        r'full_date\(([^,]+),\s*[\'"]YYYY-M-D[\'"]\)': r'\1 | date(format="%Y-%m-%d")',
        r'full_date\(([^,]+),\s*[\'"]M-D[\'"]\)': r'\1 | date(format="%m-%d")',
        r'is_home\(\)': 'current_path == "/"',
        r'is_post\(\)': 'section != ""',
        r'is_page\(\)': 'section == ""',
        r'is_archive\(\)': 'section == "posts"',
        r'is_tag\(\)': 'taxonomy == "tags"',
        r'is_category\(\)': 'taxonomy == "categories"',
        r'hex2str\(([^)]+)\)': '\1',
        r'hex2rgb\(([^)]+)\)': '\1',
        r'rgb2hsl\(([^)]+)\)': '\1',
        r'hsl2rgb\(([^)]+)\)': '\1',
        r'rgb2hex\(([^)]+)\)': '\1',
        r'config\.title': 'config.title',
        r'config\.description': 'config.description',
        r'theme\.([a-zA-Z_]+)': 'config.extra.\\1',
        r'page\.title': 'page.title',
        r'page\.date': 'page.date',
        r'page\.path': 'page.path',
        r'page\.content': 'page.content',
        r'page\.tags': 'page.taxonomies.tags',
        r'page\.categories': 'page.taxonomies.categories',
        r'post\.title': 'post.title',
        r'post\.date': 'post.date',
        r'post\.path': 'post.path',
        r'post\.content': 'post.content',
        r'post\.tags': 'post.taxonomies.tags',
        r'post\.categories': 'post.taxonomies.categories',
        r'site\.posts\.length': 'section.pages | length',
        r'site\.categories\.length': 'taxonomies.categories | length',
        r'site\.tags\.length': 'taxonomies.tags | length',
        r'list_tags\(([^,]+),\s*\{[^}]*\}\)': '\\1',
        r'list_categories\(([^,]+),\s*\{[^}]*\}\)': '\\1',
        r'wordcount\(([^)]+)\)': '\\1 | wordcount',
        r'min2read\(([^,]+),\s*\{[^}]*\}\)': '\\1 | reading_time',
        r'getexcerpt\(([^,]+),\s*\d+,\s*true\)': '\\1 | striptags | truncate(length=175)',
        r'argon_preprocess_article\(([^,]+),\s*[^,]+,\s*true\)': '\\1 | safe',
        r'has_thumbnail\(([^,]+),\s*[^)]+\)': 'false',
        r'get_thumbnail\(([^,]+),\s*[^)]+\)': '""',
        r'argon_version\(\)': '"1.0.0"',
        r'open_graph\(\)': '""',
    }
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    # 10. 修复遗留的 %> 和 <%
    content = content.replace('%>', '')
    content = content.replace('<%', '{%')

    # 11. 修复双花括号问题
    content = re.sub(r'\{\{ (.*?) \}\}', r'{{ \1 }}', content)

    # 12. 写入文件
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Converted: {filepath}")

# 遍历所有 .ejs 文件
for root, dirs, files in os.walk(DST):
    for f in files:
        if f.endswith('.ejs'):
            old_path = os.path.join(root, f)
            new_name = f.replace('.ejs', '.html')
            new_path = os.path.join(root, new_name)
            os.rename(old_path, new_path)
            convert_file(new_path)

print("\nDone! Templates converted to:", DST)