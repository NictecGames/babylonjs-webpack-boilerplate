class App {
  public static addHello (): void {
    let h1 = document.createElement('h1')
    h1.innerText = 'Hello World'
    document.body.appendChild(h1)
  }
}

App.addHello()
