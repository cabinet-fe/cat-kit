# 响应式布局

现在最为人所知的响应式布局方案是通过css的@media指令实现的.

媒体查询有很大的缺陷, 就是他只能基于屏幕去响应, 而无法基于布局容器本身去实现.

## 如何在容器中实现

答案是通过js Web API实现.

浏览器中提供了一个构造函数ResizeObserver. 该api能够对指定的dom进行监听, 监听其size大小的变化, 一旦变化即可做出其他操作.

```ts
const observer = new ResizeObserver((entries) => {
  // do sth
})

observer.observe(document.getElementById('container'))
```

## 新的CSS特性

@container是一项新的css特性, 他可以实现和上述js中同样的效果, 并且功能更加清大, 效果更好, 实现起来更加方便, 缺点是兼容性相对较差.

```css
@container layout (width < 400px) {
  /* 样式 */
}

.container {
  container-name: layout;
  container-type: inline-size;
}
```