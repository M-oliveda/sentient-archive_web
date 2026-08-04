import { act, fireEvent, render, screen } from "@testing-library/react";
import useEmblaCarousel from "embla-carousel-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useCarousel } from "@/components/ui/use-carousel";

jest.mock("embla-carousel-react", () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockedUseEmblaCarousel = useEmblaCarousel as jest.MockedFunction<
    typeof useEmblaCarousel
>;

type EmblaEventCallback = (api: unknown) => void;

interface IMockEmblaApi {
    scrollPrev: jest.Mock;
    scrollNext: jest.Mock;
    canScrollPrev: jest.Mock<boolean, []>;
    canScrollNext: jest.Mock<boolean, []>;
    on: jest.Mock<IMockEmblaApi, [string, EmblaEventCallback]>;
    off: jest.Mock<IMockEmblaApi, [string, EmblaEventCallback]>;
    emit: (event: string) => void;
}

function createMockApi(
    overrides: Partial<{
        canScrollPrev: boolean;
        canScrollNext: boolean;
    }> = {},
): IMockEmblaApi {
    const listeners: Record<string, EmblaEventCallback[]> = {};

    const api: IMockEmblaApi = {
        scrollPrev: jest.fn(),
        scrollNext: jest.fn(),
        canScrollPrev: jest.fn(() => overrides.canScrollPrev ?? false),
        canScrollNext: jest.fn(() => overrides.canScrollNext ?? false),
        on: jest.fn((event: string, cb: EmblaEventCallback) => {
            listeners[event] = listeners[event] ?? [];
            listeners[event].push(cb);
            return api;
        }),
        off: jest.fn((event: string, cb: EmblaEventCallback) => {
            listeners[event] = (listeners[event] ?? []).filter((fn) => fn !== cb);
            return api;
        }),
        emit: (event: string) => {
            for (const cb of listeners[event] ?? []) {
                cb(api);
            }
        },
    };

    return api;
}

function renderCarousel(
    props: React.ComponentProps<typeof Carousel> = {},
    apiOverrides?: Parameters<typeof createMockApi>[0],
) {
    const api = createMockApi(apiOverrides);
    const carouselRef = jest.fn();
    mockedUseEmblaCarousel.mockReturnValue([carouselRef, api as never]);

    const view = render(
        <Carousel {...props}>
            <CarouselContent>
                <CarouselItem>Slide 1</CarouselItem>
                <CarouselItem>Slide 2</CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>,
    );

    return { ...view, api, carouselRef };
}

describe("Carousel", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(window, "requestAnimationFrame").mockImplementation(
            (cb: FrameRequestCallback) => {
                cb(0);
                return 0;
            },
        );
        jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders carousel region with slides", () => {
        renderCarousel();

        expect(screen.getByRole("region")).toHaveAttribute(
            "aria-roledescription",
            "carousel",
        );
        expect(screen.getAllByRole("group", { name: "" })).toHaveLength(2);
        expect(screen.getByText("Slide 1")).toBeInTheDocument();
        expect(screen.getByText("Slide 2")).toBeInTheDocument();
    });

    it("passes options and plugins to embla", () => {
        const plugins: never[] = [];
        renderCarousel({
            opts: { align: "start", loop: true },
            plugins,
        });

        expect(mockedUseEmblaCarousel).toHaveBeenCalledWith(
            expect.objectContaining({
                align: "start",
                loop: true,
                axis: "x",
            }),
            plugins,
        );
    });

    it("uses vertical axis when orientation is vertical", () => {
        renderCarousel({ orientation: "vertical" });

        expect(mockedUseEmblaCarousel).toHaveBeenCalledWith(
            expect.objectContaining({ axis: "y" }),
            undefined,
        );
        expect(
            document.querySelector('[data-slot="carousel-content"] > div'),
        ).toHaveClass("-mt-4", "flex-col");
        expect(document.querySelector('[data-slot="carousel-item"]')).toHaveClass(
            "pt-4",
        );
        expect(document.querySelector('[data-slot="carousel-previous"]')).toHaveClass(
            "rotate-90",
        );
        expect(document.querySelector('[data-slot="carousel-next"]')).toHaveClass(
            "rotate-90",
        );
    });

    it("calls setApi when the embla api is ready", () => {
        const setApi = jest.fn();
        const { api } = renderCarousel({ setApi });

        expect(setApi).toHaveBeenCalledWith(api);
    });

    it("does not call setApi when embla api is unavailable", () => {
        const setApi = jest.fn();
        const carouselRef = jest.fn();
        mockedUseEmblaCarousel.mockReturnValue([carouselRef, undefined as never]);

        render(
            <Carousel setApi={setApi}>
                <CarouselContent>
                    <CarouselItem>Only slide</CarouselItem>
                </CarouselContent>
            </Carousel>,
        );

        expect(setApi).not.toHaveBeenCalled();
    });

    it("registers select handlers and updates scroll affordances", () => {
        const { api } = renderCarousel();

        api.canScrollPrev.mockReturnValue(true);
        api.canScrollNext.mockReturnValue(true);
        act(() => {
            api.emit("select");
        });

        expect(api.on).toHaveBeenCalledWith("reInit", expect.any(Function));
        expect(api.on).toHaveBeenCalledWith("select", expect.any(Function));
        expect(
            screen.getByRole("button", { name: "Previous slide" }),
        ).not.toBeDisabled();
        expect(screen.getByRole("button", { name: "Next slide" })).not.toBeDisabled();
    });

    it("unregisters listeners on unmount", () => {
        const { api, unmount } = renderCarousel();

        unmount();

        expect(window.cancelAnimationFrame).toHaveBeenCalled();
        expect(api.off).toHaveBeenCalledWith("reInit", expect.any(Function));
        expect(api.off).toHaveBeenCalledWith("select", expect.any(Function));
    });

    it("scrolls with previous and next buttons", () => {
        const { api } = renderCarousel();
        api.canScrollPrev.mockReturnValue(true);
        api.canScrollNext.mockReturnValue(true);
        act(() => {
            api.emit("select");
        });

        fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
        fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

        expect(api.scrollPrev).toHaveBeenCalled();
        expect(api.scrollNext).toHaveBeenCalled();
    });

    it("disables navigation when scrolling is not possible", () => {
        renderCarousel({
            // defaults: cannot scroll either way
        });

        expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    });

    it("navigates with arrow keys", () => {
        const { api } = renderCarousel();
        const region = screen.getByRole("region");

        fireEvent.keyDown(region, { key: "ArrowLeft" });
        fireEvent.keyDown(region, { key: "ArrowRight" });
        fireEvent.keyDown(region, { key: "ArrowUp" });

        expect(api.scrollPrev).toHaveBeenCalledTimes(1);
        expect(api.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("throws when useCarousel is used outside Carousel", () => {
        function Orphan() {
            useCarousel();
            return null;
        }

        expect(() => render(<Orphan />)).toThrow(
            "useCarousel must be used within a <Carousel />",
        );
    });

    it("falls back to vertical layout when opts.axis is y and orientation is unset", () => {
        const api = createMockApi();
        const carouselRef = jest.fn();
        mockedUseEmblaCarousel.mockReturnValue([carouselRef, api as never]);

        // Empty string bypasses the default param and exercises opts.axis inference
        render(
            <Carousel orientation={"" as unknown as "horizontal"} opts={{ axis: "y" }}>
                <CarouselContent>
                    <CarouselItem>Vertical slide</CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>,
        );

        expect(
            document.querySelector('[data-slot="carousel-content"] > div'),
        ).toHaveClass("flex-col");
    });

    it("falls back to horizontal layout when opts.axis is not y and orientation is unset", () => {
        const api = createMockApi();
        const carouselRef = jest.fn();
        mockedUseEmblaCarousel.mockReturnValue([carouselRef, api as never]);

        render(
            <Carousel orientation={"" as unknown as "horizontal"} opts={{ axis: "x" }}>
                <CarouselContent>
                    <CarouselItem>Horizontal slide</CarouselItem>
                </CarouselContent>
            </Carousel>,
        );

        expect(
            document.querySelector('[data-slot="carousel-content"] > div'),
        ).toHaveClass("-ml-4");
    });

    it("ignores onSelect when the embla api argument is missing", () => {
        const { api } = renderCarousel();
        const selectHandler = api.on.mock.calls.find(
            (call: [string, EmblaEventCallback]) => call[0] === "select",
        )?.[1] as EmblaEventCallback | undefined;

        expect(selectHandler).toBeDefined();
        api.canScrollPrev.mockClear();
        api.canScrollNext.mockClear();

        expect(() => selectHandler?.(undefined)).not.toThrow();
        expect(api.canScrollPrev).not.toHaveBeenCalled();
        expect(api.canScrollNext).not.toHaveBeenCalled();
    });

    it("safely no-ops scroll helpers when embla api is unavailable", () => {
        const carouselRef = jest.fn();
        mockedUseEmblaCarousel.mockReturnValue([carouselRef, undefined as never]);

        render(
            <Carousel>
                <CarouselContent>
                    <CarouselItem>Only slide</CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>,
        );

        const region = screen.getByRole("region");
        fireEvent.keyDown(region, { key: "ArrowLeft" });
        fireEvent.keyDown(region, { key: "ArrowRight" });

        expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    });
});
