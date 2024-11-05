---
title: "AvaloniaUI control with custom rendering"
publishDate: "2024-06-07"
updated: "2024-06-07"
isFeatured: true
tags:
  - Guide
  - .NET
  - AvaloniaUI
  - C#
excerpt: "Creating custom control with custom graphics"
---

In order to draw some custom graphics on a control we can use Skiasharp library, which is bundled with Avalonia as a dependency. First, we need to create a class for our new control. We'll use a snippet from one of the AvaloniaUI devs - [Nikita Tsukanov](https://github.com/kekekeks) ([src](https://github.com/AvaloniaUI/Avalonia/blob/master/samples/RenderDemo/Pages/CustomSkiaPage.cs)).

```csharp
namespace MyApp.CustomControls
{
 public class CustomControl : UserControl
 {
  class CustomDrawOp :ICustomDrawOperation
  {
   private readonly IImmutableGlyphRunReference? _noSkia;
        private SKCanvas? _canvas;
      
   public CustomDrawOp(Rect Bounds, GlyphRun noSkia)
   {
    _noSkia = noSkia.TryCreateImmutableGlyphRunReference();
    Bounds = bounds;
   }
   
   public void Dispose()
   {
    // Dispose whatever were added to control
   }
   public Rect Bounds {get; }
   public bool HitTest (Point p) => true;
   public bool Equals (ICustomDrawOperation? other) => false;
   public void Render(ImmediateDrawingContext context)
   {
    var leaseFeature = context.TryGetFeature<ISkiaSharpApiLeaseFeature>();
    if (leaseFeature == null)
    {
     context.DrawGlyphRun(Brush.Parse("#000000").ToImmutable(), _noSkia!);
    }
    else
    {
     using var lease = leaseFeature.Lease();
     _canvas = lease.SkCanvas;
     _canvas.Clear(SKColor.Parse("#00000000"));
     // ... draw anything with SkiaSharp on _canvas
     _canvas.Restore();
    }
   }
  }
  public override void Render(DrawinngContext context)
  {
   context.Custom(new CustomDrawOp(new Rect(0, 0, Bounds.Width, Bounds.Height), _noSkia);
   Dispatcher.UIThread.InvokeAsync(InvalidateVisual, DispatcherPriority.Background);
  }
 }
}
```

Most likely our control has to visualize some data from the ViewModel. Let's use bindings mechanism for that:

```csharp
public static readonly DirectProperty<IntegrityView, IEnumerable<int>> XProperty =
    AvaloniaProperty.RegisterDirect<IntegrityView, IEnumerable<int>>(
        nameof(X),
        o => o.X,
        (o, v) => o.X = v);

private IEnumerable<int> _x = new AvaloniaList<int>();

public IEnumerable<int> X
{
    get => _x;
    set => SetAndRaise(XProperty, ref _x, value);
}
```

Now we can bind a property from the ViewModel to the UserControl and render things there. It's time to actually use the control:

Add the reference to our control to the View, which will be using it:

```xml
    xmlns:cc="using:MyApp.CustomControls"
```

And add the control to the markup, binding some data from the ViewModel:

```xml
 <cc:CustomControl
  X="{Binding XValues}" />
```
